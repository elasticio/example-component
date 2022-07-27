import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import ExampleClient from '../../src/client';
import { processAction } from '../../src/actions/lookupObject';

chai.use(require('chai-as-promised'));

const fakeResponse = { data: { resultKey: 'resultValue' } };

describe('lookupObject action', () => {
  let execRequest;
  describe('should lookup object', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should lookup object', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id'
      };
      const msg = { body: { lookupCriteriaValue: 123 } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${cfg.lookupCriteria}/${msg.body.lookupCriteriaValue}`
      });
    });
  });
  describe('object not found (allowZeroResults: true), should emit empty result', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => { throw new StatusCodeError(404); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('object not found (allowZeroResults: true)', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id',
        allowZeroResults: true,
      };
      const msg = { body: { lookupCriteriaValue: 123 } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal({});
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${cfg.lookupCriteria}/${msg.body.lookupCriteriaValue}`
      });
    });
  });
  describe('should emit empty result (lookupCriteria: undefined, allowCriteriaToBeOmitted: true)', () => {
    it('should emit empty result (lookupCriteria: undefined, allowCriteriaToBeOmitted: true)', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id',
        allowCriteriaToBeOmitted: true
      };
      const msg = { body: {} };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(body).to.be.deep.equal({});
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => { throw new StatusCodeError(404); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('object not found', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id',
      };
      const msg = { body: { lookupCriteriaValue: 123 } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('No object found!');
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${cfg.lookupCriteria}/${msg.body.lookupCriteriaValue}`
      });
    });
    it('No "Lookup Criteria Value" provided', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id',
      };
      const msg = { body: {} };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('No "Lookup Criteria Value" provided!');
      expect(execRequest.callCount).to.be.equal(0);
    });
  });
  describe('api error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => { throw new StatusCodeError(403); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('api error', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id',
      };
      const msg = { body: { lookupCriteriaValue: 123 } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('StatusCodeError');
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${cfg.lookupCriteria}/${msg.body.lookupCriteriaValue}`
      });
    });
  });
});

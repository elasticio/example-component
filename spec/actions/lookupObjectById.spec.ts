import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import ExampleClient from '../../src/client';
import { processAction } from '../../src/actions/lookupObjectById';

chai.use(require('chai-as-promised'));

const fakeResponse: any = { data: { resultKey: 'resultValue' } };

describe('lookupObjectById action', () => {
  let execRequest;
  describe('should lookupObjectById', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should lookupObjectById', async () => {
      const cfg = {
        objectType: 'users'
      };
      const msg = { body: { idValue: 123 } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${msg.body.idValue}`
      });
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
        objectType: 'users'
      };
      const msg = { body: { idValue: 123 } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('StatusCodeError');
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${msg.body.idValue}`
      });
    });
    it('No "ID Value" provided', async () => {
      const cfg = {
        objectType: 'users'
      };
      const msg = { body: {} };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('No "ID Value" provided!');
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
      };
      const msg = { body: { idValue: 123 } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('StatusCodeError');
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${msg.body.idValue}`
      });
    });
  });
});

import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import ExampleClient from '../../src/client';
import { processAction } from '../../src/actions/upsertObject';

chai.use(require('chai-as-promised'));

const fakeResponse = { data: { resultKey: 'resultValue' } };
const upsertMsgBody = { email: 'email', gender: 'm' };

describe('lookupObject action', () => {
  let execRequest;
  describe('should update object', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest')
        .onFirstCall()
        .callsFake(async () => fakeResponse)
        .onSecondCall()
        .callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should update object', async () => {
      const cfg = {
        objectType: 'users',
      };
      const msg = { body: { id: '123', ...upsertMsgBody } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(2);
      expect(body).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${msg.body.id}`
      });
      expect(execRequest.getCall(1).args[0]).to.be.deep.equal({
        method: 'PUT',
        url: `/${cfg.objectType}/${msg.body.id}`,
        data: upsertMsgBody
      });
    });
  });
  describe('should create object', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest')
        .onFirstCall()
        .callsFake(async () => { throw new StatusCodeError(404); })
        .onSecondCall()
        .callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should create object', async () => {
      const cfg = {
        objectType: 'users',
      };
      const msg = { body: { id: '123', ...upsertMsgBody } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(2);
      expect(body).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${msg.body.id}`
      });
      expect(execRequest.getCall(1).args[0]).to.be.deep.equal({
        method: 'POST',
        url: `/${cfg.objectType}`,
        data: upsertMsgBody
      });
    });
  });
  describe('should create object', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should create object', async () => {
      const cfg = {
        objectType: 'users',
      };
      const msg = { body: { ...upsertMsgBody } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'POST',
        url: `/${cfg.objectType}`,
        data: upsertMsgBody
      });
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => { throw new StatusCodeError(400); });
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should create object', async () => {
      const cfg = {
        objectType: 'users',
      };
      const msg = { body: { id: '123', ...upsertMsgBody } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('StatusCodeError');
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'GET',
        url: `/${cfg.objectType}/${msg.body.id}`
      });
    });
  });
});

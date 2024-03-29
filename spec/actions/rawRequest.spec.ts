import chai, { expect } from 'chai';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import ExampleClient from '../../src/client';
import { processAction } from '../../src/actions/rawRequest';

chai.use(require('chai-as-promised'));

const fakeResponse: any = {
  data: {},
  status: 200,
  headers: {}
};

describe('rawRequest action', () => {
  let execRequest;
  describe('succeed', () => {
    beforeEach(() => {
      execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should make get request', async () => {
      const cfg = {};
      const msg = { body: { method: 'POST', url: '/example' } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal({
        statusCode: fakeResponse.status,
        headers: fakeResponse.headers,
        responseBody: fakeResponse.data
      });
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
      const cfg = {};
      const msg = { body: { method: 'POST', url: '/example' } };
      await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('StatusCodeError');
      expect(execRequest.callCount).to.be.equal(1);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        data: undefined,
        method: 'POST',
        url: `/example`
      });
    });
  });
});

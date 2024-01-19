import { expect, use } from 'chai';
import chaiPromised from 'chai-as-promised';
import sinon from 'sinon';
import { getContext, StatusCodeError } from '../common';
import Client from '../../src/Client';
import { processAction } from '../../src/actions/deleteObject';

use(chaiPromised);

const fakeResponse: any = { data: { resultKey: 'resultValue' } };

describe('deleteObject action', () => {
  let execRequest;
  describe('should delete object', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'apiRequest').callsFake(async () => fakeResponse);
    });
    afterEach(() => {
      sinon.restore();
    });
    it('should delete object', async () => {
      const cfg = {
        objectType: 'users',
        lookupCriteria: 'id'
      };
      const msg = { body: { lookupCriteriaValue: 123 } };
      const { body } = await processAction.call(getContext(), msg, cfg);
      expect(execRequest.callCount).to.be.equal(1);
      expect(body).to.be.deep.equal(fakeResponse.data);
      expect(execRequest.getCall(0).args[0]).to.be.deep.equal({
        method: 'DELETE',
        url: `/${cfg.objectType}/${cfg.lookupCriteria}/${msg.body.lookupCriteriaValue}`
      });
    });
  });
  describe('should throw error', () => {
    beforeEach(() => {
      execRequest = sinon.stub(Client.prototype, 'apiRequest').callsFake(async () => { throw new StatusCodeError(404); });
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
        method: 'DELETE',
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
});

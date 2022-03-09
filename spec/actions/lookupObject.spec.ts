import { expect } from 'chai';
import sinon from 'sinon';
import { getContext } from '../common';
import ExampleClient from '../../src/client';

const processAction = require('../../src/actions/lookupObject');

const fakeResponse = { result: { resultKey: 'resultValue' } };

describe('lookupObject action', () => {
  let execRequest;
  beforeEach(() => {
    execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => fakeResponse);
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should lookup object', async () => {
    const cfg = {
      token: 'secret',
      store_hash: 'hash',
      objectType: 'brand',
      lookupCriteria: 'id',
      allowIdToBeOmitted: false,
    };
    const msg = { body: { lookupCriteriaValue: 123 } };
    const { body } = await processAction.process.call(getContext(), msg, cfg);
    expect(execRequest.callCount).to.be.equal(1);
    expect(body).to.be.deep.equal(fakeResponse);
  });
});

import { expect } from 'chai';
import sinon from 'sinon';
import { getContext } from '../common';
import ExampleClient from '../../src/client';
import { processAction } from '../../src/actions/rawRequest';

const fakeResponse = {
  data: {},
  status: 200,
  headers: {}
};

describe('rawRequest action', () => {
  let execRequest;
  beforeEach(() => {
    execRequest = sinon.stub(ExampleClient.prototype, 'apiRequest').callsFake(async () => fakeResponse);
  });
  afterEach(() => {
    sinon.restore();
  });
  it('should make get request', async () => {
    const cfg = { throw404: false };
    const msg = { body: { method: 'POST', url: '/example', } };
    const { body } = await processAction.call(getContext(), msg, cfg);
    expect(execRequest.callCount).to.be.equal(1);
    expect(body).to.be.deep.equal(fakeResponse);
  });
});

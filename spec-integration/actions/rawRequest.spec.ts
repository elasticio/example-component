import { expect } from 'chai';
import { processAction } from '../../src/actions/rawRequest';
import { getContext, creds } from '../common';

describe('rawRequest', () => {
  it('should make raw request', async () => {
    const cfg = { throw404: false };
    const msg = { body: { method: 'GET', url: '/' } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body.statusCode).to.be.equal(200);
  });
});

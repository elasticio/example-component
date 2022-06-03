import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/rawRequest';

describe('rawRequest', () => {
  it('should make raw request', async () => {
    const cfg = { throw404: false };
    const msg = { body: { method: 'GET', url: '/' } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body.statusCode).to.be.equal(200);
  });
});

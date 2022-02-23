import { expect } from 'chai';
import { processAction } from '../../src/actions/rawRequest';
import { getContext, creds } from '../common';

describe.only('rawRequest', () => {
  it('should make raw request', async () => {
    const msg = { body: { method: 'GET', url: '/' } };
    const result = await processAction.call(getContext(), msg, creds);
    expect(result.body.statusCode).to.be.equal(200);
  });
});

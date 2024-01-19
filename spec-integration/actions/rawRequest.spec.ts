import { expect } from 'chai';
import { getContext, creds } from '../common';
import { processAction } from '../../src/actions/makeRawRequest';

describe('rawRequest', () => {
  it('should make raw request', async () => {
    const cfg = {};
    const msg = { body: { method: 'GET', url: '/' } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body.statusCode).to.be.equal(200);
  });
  it('should succeed, doNotThrow404: true', async () => {
    const cfg = { doNotThrow404: true };
    const msg = { body: { method: 'GET', url: '/' } };
    const { body } = await processAction.call(getContext(), msg, { ...creds, ...cfg });
    expect(body.statusCode).to.be.equal(404);
  });
  it('should throw error, doNotThrow404: false', async () => {
    const cfg = {};
    const msg = { body: { method: 'GET', url: '/' } };
    await expect(processAction.call(getContext(), msg, { ...creds, ...cfg })).to.be.rejectedWith('404');
  });
});

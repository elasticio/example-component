import chai, { expect } from 'chai';
import nock from 'nock';
import { getContext } from './common';
import { processAction } from '../src/actions/rawRequest';

chai.use(require('chai-as-promised'));

describe('nock apiRequest', () => {
  it('should retry 3 times and throw error', async () => {
    const cfg = {};
    const msg = { body: { method: 'GET', url: '/example' } };

    nock('http://localhost').get('/example').times(3).reply(500);
    await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('Got error "unknown", status - "500", body: "no body found"');
  });
  it('should retry 1 time return result', async () => {
    const cfg = {};
    const msg = { body: { method: 'GET', url: '/example' } };

    nock('http://localhost')
      .get('/example').times(2).reply(500)
      .get('/example')
      .reply(200, {});
    const { body } = await processAction.call(getContext(), msg, cfg);
    expect(body).to.be.deep.equal({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      responseBody: {}
    });
  });
  it('should throw 400 error (without retry)', async () => {
    const cfg = {};
    const msg = { body: { method: 'GET', url: '/example' } };

    nock('http://localhost').get('/example').reply(400, {});
    await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('Got error "unknown", status - "400", body: {}');
  });
  it('should throw 404 error (without retry)', async () => {
    const cfg = {};
    const msg = { body: { method: 'GET', url: '/example' } };

    nock('http://localhost').get('/example').reply(404, {});
    await expect(processAction.call(getContext(), msg, cfg)).to.be.rejectedWith('Got error "unknown", status - "404", body: {}');
  });
  it('should return result (doNotThrow404: true)', async () => {
    const cfg = { doNotThrow404: true };
    const msg = { body: { method: 'GET', url: '/example' } };

    nock('http://localhost').get('/example').reply(404, {});
    const { body } = await processAction.call(getContext(), msg, cfg);
    expect(body).to.be.deep.equal({
      statusCode: 404,
      headers: { 'content-type': 'application/json' },
      responseBody: {}
    });
  });
});

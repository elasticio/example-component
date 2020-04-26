/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const makeRawRequest = require('../../lib/actions/makeRawRequest.js');

const { expect } = chai;
chai.use(require('chai-as-promised'));

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

let cfg;
let msg;

// we set up a sinon spy on the emit function so that
// we can determine what data/errors are emitted.
const emitter = {
  emit: sinon.spy(),
  logger,
};

describe('Delete Object by Unique Criteria integration tests', () => {
  beforeEach(() => {
    cfg = {
      url: process.env.API_BASE_URI,
      username: process.env.UNAME,
      password: process.env.PASSWORD,
    };
  });

  afterEach(() => {
    emitter.emit.resetHistory();
  });

  it('Simple GET request', async () => {
    msg = {
      body: {
        method: 'GET',
        url: 'posts/1',
      },
    };

    await makeRawRequest.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body).to.deep.equal(
      {
        responseBody: {
          body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
          created: '2008-04-11T06:18:02.444Z',
          id: 1,
          lastModified: '2008-04-11T06:18:02.444Z',
          title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
          userId: 1,
        },
      },
    );
  });
});

/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const deleteObject = require('../../lib/actions/deleteObject.js');

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
      objectType: 'users',
    };

    msg = {
      body: {
        id: 10,
      },
    };
  });
  afterEach(() => {
    emitter.emit.resetHistory();
  });

  it('should successfully delete an object by unique criteria', async () => {
    cfg.deleteCriteria = 'email';
    msg.body.email = 'Nathan@yesenia.net';

    await deleteObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body).to.deep.equal({
      id: 3,
    });
  });

  it('should return an empty object when object to delete is not found', async () => {
    msg.body.id = '2384732';

    await deleteObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body).to.deep.equal({});
  });

  // Testing the helper functions:

  // Test whether the dynamic metadata is correctly retrieved
  it('should return the appropriate object unique field metadata shape based on the deleteCriteria', async () => {
    cfg.deleteCriteria = 'email';
    const result = await deleteObject.getMetaModel.call(emitter, cfg);
    expect(result.in).to.deep.equal({
      type: 'object',
      properties: {
        email: {
          title: 'Email Address',
          type: 'string',
          required: true,
          unique: true,
        },
      },
    });
  });

  // Testing the proper functioning of getUniqueFieldsModel
  it('should return a list of unique attributes for the selected objectType', async () => {
    const result = await deleteObject.getUniqueFieldsModel.call(emitter, cfg);
    expect(result).to.deep.equal({
      id: 'ID',
      username: 'Username',
      email: 'Email Address',
    });
  });
});

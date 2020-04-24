/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const upsert = require('../../lib/actions/upsert.js');

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

describe('Upsert Object by Unique Criteria integration tests', () => {
  beforeEach(() => {
    // the configuration
    cfg = {
      url: process.env.API_BASE_URI,
      username: process.env.UNAME,
      password: process.env.PASSWORD,
      objectType: 'posts',
      upsertCriteria: 'id',
    };

    // The object metadata that will be upserted. Its structure is based
    // off of the object we select to upsert, which will be a post.
    msg = {
      body: {
        userId: 1,
        id: 10,
        title: 'a NEW title',
        body: 'a NEW body text',
      },
    };
  });
  afterEach(() => {
    emitter.emit.resetHistory();
  });

  it('should successfully update a pre-existing object', async () => {
    await upsert.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body.updatedObject).to.deep.equal({
      userId: 1,
      id: 10,
      title: 'a NEW title',
      body: 'a NEW body text',
      created: '1972-12-19T19:35:25.697Z',
      lastModified: '1972-12-19T19:35:25.697Z',
    });
  });

  it('should successfully create a new object', async () => {
    msg.body.id = 2473629402;

    await upsert.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body.createdObject).to.deep.equal({
      userId: 1,
      id: 2473629402,
      title: 'a NEW title',
      body: 'a NEW body text',
    });
  });

  it('should successfully create a pre-existing object with a url-encoded query parameter', async () => {
    cfg.objectType = 'users';
    cfg.upsertCriteria = 'username';

    msg.body = {
      id: 123456890,
      name: 'bob',
      username: 'Do you like Fred\'s Fish & Chips?',
      email: 'bob@fredsfishnchips.com',
      address: {
        street: '1 Marina Way',
        city: 'Port Stanley',
        zipcode: '123456',
      },
      phone: '1 (800) 854-FISH',
    };

    await upsert.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body.createdObject).to.deep.equal({
      id: 123456890,
      name: 'bob',
      username: 'Do you like Fred\'s Fish & Chips?',
      email: 'bob@fredsfishnchips.com',
      address: {
        street: '1 Marina Way',
        city: 'Port Stanley',
        zipcode: '123456',
      },
      phone: '1 (800) 854-FISH',
    });
  });

  // It's important to test every function of the action.
  // Here we are testing whether the dynamic metadata is correctly retrieved.
  it('should return the appropriate post object metadata shape', async () => {
    const result = await upsert.getMetaModel.call(emitter, cfg);
    expect(result.in).to.deep.equal({
      type: 'object',
      properties: {
        userId: {
          title: 'User ID',
          type: 'number',
          required: true,
        },
        id: {
          title: 'ID (Upsert Criteria)',
          type: 'number',
          required: false,
          unique: true,
        },
        title: {
          title: 'Title',
          type: 'string',
          required: true,
        },
        body: {
          title: 'Body',
          type: 'string',
          required: true,
        },
      },
    });
  });

  // Testing the proper functioning of getUniqueFieldsModel
  it('should return a list of unique attributes for the selected objectType', async () => {
    cfg.objectType = 'users';

    const result = await upsert.getUniqueFieldsModel.call(emitter, cfg);
    expect(result).to.deep.equal({
      id: 'ID',
      username: 'Username',
      email: 'Email Address',
    });
  });
});

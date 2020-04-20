/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const upsert = require('../../lib/actions/upsert.js');

const { expect } = chai;
chai.use(require('chai-as-promised'));

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

let cfg;

// The object metadata that will be upserted. Its structure is based
// off of the object we select to upsert, which will be a post.
const msg = {
  body: {
    userId: 1,
    id: 10,
    title: 'a NEW title',
    body: 'a NEW body text',
  },
};

// we set up a sinon spy on the emit function so that
// we can determine what data/errors are emitted.
const emitter = {
  emit: sinon.spy(),
  logger,
};

describe('Upsert Object by ID integration tests', () => {
  beforeEach(() => {
    // the configuration
    cfg = {
      url: process.env.API_BASE_URI,
      username: process.env.UNAME,
      password: process.env.PASSWORD,
      objectType: 'posts',
      upsertCriteria: 'id',
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

  it('should emit an error with invalid credentials', async () => {
    cfg.username = 'bob';

    await expect(upsert.process.call(emitter, msg, cfg, () => {
      expect(emitter.emit.calledOnce).to.be.true;
      expect(emitter.emit.lastCall.args[0]).to.equal('Error');
    })).to.eventually.be.rejected;
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
          required: true,
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

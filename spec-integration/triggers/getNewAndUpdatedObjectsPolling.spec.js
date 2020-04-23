/* eslint-disable no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const trigger = require('../../lib/triggers/getNewAndUpdatedObjectsPolling.js');

const { expect } = chai;
chai.use(require('chai-as-promised'));

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

let cfg;

// we set up a sinon spy on the emit function so that
// we can determine what data/errors are emitted.
const emitter = {
  emit: sinon.spy(),
  logger,
};

describe('Get New and Updated Objects Polling integration tests', () => {
  beforeEach(() => {
    cfg = {
      url: process.env.API_BASE_URI,
      username: process.env.UNAME,
      password: process.env.PASSWORD,
      objectType: 'posts',
    };
  });
  afterEach(() => {
    emitter.emit.resetHistory();
  });

  it('should successfully retrieve a list of objects within a given start and end time', async () => {
    cfg.startTime = '2019-03-17T16:33:08.809Z';
    cfg.endTime = '2019-06-11T05:09:22.308Z';

    await trigger.process.call(emitter, {}, cfg);
    expect(emitter.emit.calledTwice).to.be.true;
    expect(emitter.emit.firstCall.args[1].body).to.deep.equal(
      {
        userId: 5,
        id: 50,
        title: 'repellendus qui recusandae incidunt voluptates tenetur qui omnis exercitationem',
        body: 'error suscipit maxime adipisci consequuntur recusandae\nvoluptas eligendi et est et voluptates\nquia distinctio ab amet quaerat molestiae et vitae\nadipisci impedit sequi nesciunt quis consectetur',
        created: '2019-03-17T16:33:08.809Z',
        lastModified: '2019-03-17T16:33:08.809Z',
      },
    );
    expect(emitter.emit.secondCall.args[1].body).to.deep.equal(
      {
        userId: 4,
        id: 32,
        title: 'doloremque illum aliquid sunt',
        body: 'deserunt eos nobis asperiores et hic\nest debitis repellat molestiae optio\nnihil ratione ut eos beatae quibusdam distinctio maiores\nearum voluptates et aut adipisci ea maiores voluptas maxime',
        created: '2019-06-11T05:09:22.308Z',
        lastModified: '2019-06-11T05:09:22.308Z',
      },
    );
  });

  it('should throw an error with an improperly formatted date string', async () => {
    cfg.startTime = '2019-03-17 16:33:08.809';

    await expect(trigger.process.call(emitter, {}, cfg))
      .to.eventually.be.rejectedWith('Please enter a date in the format "YYYY-MM-DD[T]HH:MM:SS[Z]" where [] wraps a fixed character value');
  });

  // Testing the helper functions:

  // Test whether the dynamic metadata is correctly retrieved
  it('should return the appropriate object unique field metadata shape based on the deleteCriteria', async () => {
    const result = await trigger.getMetaModel.call(emitter, cfg);
    expect(result.out).to.deep.equal({
      type: 'object',
      properties: {
        userId: {
          title: 'User ID',
          type: 'number',
          required: true,
        },
        id: {
          title: 'ID',
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
        created: {
          title: 'Created Time',
          type: 'string',
        },
        lastModified: {
          title: 'Time Last Modified',
          type: 'string',
        },
      },
    });
  });
});

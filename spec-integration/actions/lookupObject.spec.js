/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const lookupObject = require('../../lib/actions/lookupObject.js');

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

describe('Upsert Object by ID integration tests', () => {
  beforeEach(() => {
    // the configuration
    cfg = {
      url: process.env.API_BASE_URI,
      username: process.env.UNAME,
      password: process.env.PASSWORD,
      objectType: 'users',
      lookupCriteria: 'id',
    };

    // The object metadata that will be upserted. Its structure is based
    // off of the object we select to upsert, which will be a post.
    msg = {
      body: {
        id: 10,
      },
    };
  });
  afterEach(() => {
    emitter.emit.resetHistory();
  });

  it('should successfully retrieve an object by unique id', async () => {
    cfg.lookupCriteria = 'username';
    msg.body.username = 'Moriah.Stanton';

    await lookupObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body.foundObject).to.deep.equal({
      id: 10,
      name: 'Clementina DuBuque',
      username: 'Moriah.Stanton',
      email: 'Rey.Padberg@karina.biz',
      address: {
        street: 'Kattie Turnpike',
        suite: 'Suite 198',
        city: 'Lebsackbury',
        zipcode: '31428-2261',
        geo: {
          lat: '-38.2386',
          lng: '57.2232',
        },
      },
      phone: '024-648-3804',
      website: 'ambrose.net',
      company: {
        name: 'Hoeger LLC',
        catchPhrase: 'Centralized empowering task-force',
        bs: 'target end-to-end models',
      },
      created: '2015-11-18T02:27:00.954Z',
      lastModified: '2015-11-18T02:27:00.954Z',
    });
  });

  it('should successfully retrieve an object with its parent', async () => {
    cfg.lookupCriteria = 'comments';
    cfg.linkedObjectToPopulate = 'post';

    await lookupObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body.createdObject).to.deep.equal({
      postId: 2,
      id: 10,
      name: 'eaque et deleniti atque tenetur ut quo ut',
      email: 'Carmen_Keeling@caroline.name',
      body: 'voluptate iusto quis nobis reprehenderit ipsum amet nulla\nquia quas dolores velit et non\naut quia necessitatibus\nnostrum quaerat nulla et accusamus nisi facilis',
      created: '2011-06-10T16:36:48.898Z',
      lastModified: '2011-06-10T16:36:48.898Z',
      post: {
        userId: 1,
        id: 2,
        title: 'qui est esse',
        body: 'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla',
        created: '2010-01-12T22:33:59.741Z',
        lastModified: '2010-01-12T22:33:59.741Z',
      },
    });
  });

  it('should return an empty object when allowCriteriaToBeOmitted is true and criteria are omitted', async () => {
    cfg.allowCriteriaToBeOmitted = true;
    msg.body = {};

    await lookupObject.process.call(emitter, msg, cfg);
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

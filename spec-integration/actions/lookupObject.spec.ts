/* eslint-disable no-unused-expressions */
import chai from 'chai';
import sinon from 'sinon';
import fs from 'fs';

const logger = require('@elastic.io/component-logger')();
const lookupObject = require('../../src/actions/lookupObject');

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

describe('Lookup Object by Unique Criteria integration tests', () => {
  beforeEach(() => {
    cfg = {
      url: process.env.API_BASE_URI,
      username: process.env.UNAME,
      password: process.env.PASSWORD,
      objectType: 'users',
      lookupCriteria: 'id',
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
    cfg.objectType = 'comments';
    cfg.linkedObjectToPopulate = 'post';

    await lookupObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body.foundObject).to.deep.equal({
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
        body: `est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui 
        aperiam non debitis possimus qui neque nisi nulla`,
        created: '2010-01-12T22:33:59.741Z',
        lastModified: '2010-01-12T22:33:59.741Z',
      },
    });
  });

  it('should return an empty object when criteria are omitted and allowCriteriaToBeOmitted is true', async () => {
    cfg.allowCriteriaToBeOmitted = true;
    msg.body.id = '';

    await lookupObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body).to.deep.equal({});
  });

  it('should throw an error when criteria are omitted and allowCriteriaToBeOmitted is false', async () => {
    cfg.allowCriteriaToBeOmitted = false;
    msg.body.id = '';

    await expect(lookupObject.process.call(emitter, msg, cfg, () => {}))
      .to.eventually.be.rejectedWith('No entry for unique criteria has been provided');
  });

  it('should rebound then throw an error when object is not found and waitForObjectToExist is true', async () => {
    cfg.waitForObjectToExist = true;
    msg.body.id = '1237482';

    await expect(lookupObject.process.call(emitter, msg, cfg, () => {
      expect(emitter.emit.called).to.be.true;
    })).to.eventually.be.rejectedWith('Object not found');
  });

  it('should not throw an error when object is not found and allowZeroResults is true', async () => {
    cfg.allowZeroResults = true;
    msg.body.id = '1237482';

    await lookupObject.process.call(emitter, msg, cfg);
    expect(emitter.emit.calledOnce).to.be.true;
    expect(emitter.emit.lastCall.args[1].body).to.deep.equal({});
  });

  it('should throw an error when object is not found and no special config fields are set', async () => {
    msg.body.id = '1237482';

    await expect(lookupObject.process.call(emitter, msg, cfg, () => {
      expect(emitter.emit.called).to.be.false;
    })).to.eventually.be.rejectedWith('Object not found');
  });

  // Testing the helper functions:

  // Test whether the dynamic metadata is correctly retrieved
  it('should return the appropriate object unique field metadata shape based on the lookupCriteria', async () => {
    cfg.lookupCriteria = 'email';
    const result = await lookupObject.getMetaModel.call(emitter, cfg);
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
    cfg.objectType = 'users';

    const result = await lookupObject.getUniqueFieldsModel.call(emitter, cfg);
    expect(result).to.deep.equal({
      id: 'ID',
      username: 'Username',
      email: 'Email Address',
    });
  });

  // Testing the proper functioning of getLinkedObjectsModel
  it('should return a list of related objects for the selected objectType', async () => {
    cfg.objectType = 'posts';

    const result = await lookupObject.getLinkedObjectsModel.call(emitter, cfg);
    expect(result).to.deep.equal({
      comments: 'Comments',
      user: 'User',
    });
  });
});

import chai from 'chai';
import { processTrigger } from '../../src/triggers/getNewAndUpdatedObjectsPolling';
import { getContext, creds } from '../common';

const { expect } = chai;
chai.use(require('chai-as-promised'));

describe('Get New and Updated Objects Polling integration tests', () => {
  let cfg;
  const emitter = getContext();
  beforeEach(() => {
    cfg = {
      ...creds,
      objectType: 'posts',
      startTime: undefined,
      endTime: undefined,
    };
  });
  afterEach(() => {
    emitter.emit.resetHistory();
  });
  it('should successfully retrieve a list of objects within a given start and end time and emit a snapshot', async () => {
    cfg.startTime = '2019-03-17T16:33:08.809Z';
    cfg.endTime = '2019-06-11T05:09:22.308Z';

    await processTrigger.call(emitter, {}, cfg);
    expect(emitter.emit.calledThrice).to.be.equal(true);
    expect(emitter.emit.firstCall.args[1].body).to.deep.equal({
      userId: 5,
      id: 50,
      title: 'repellendus qui recusandae incidunt voluptates tenetur qui omnis exercitationem',
      body: 'error suscipit maxime',
      created: '2019-03-17T16:33:08.809Z',
      lastModified: new Date('2019-03-17T16:33:08.809Z'),
    });
    expect(emitter.emit.secondCall.args[1].body).to.deep.equal({
      userId: 4,
      id: 32,
      title: 'doloremque illum aliquid sunt',
      body: 'example',
      created: '2019-06-11T05:09:22.308Z',
      lastModified: new Date('2019-06-11T05:09:22.308Z'),
    });
    expect(emitter.emit.thirdCall.args[1]).to.deep.equal({
      startTime: '2019-06-11T05:09:22.308Z',
    });
  });

  it('should successfully retrieve a list of objects after a snapshot', async () => {
    cfg.pollConfig = 'created';
    const snapshot = { startTime: '2019-06-11T05:09:22.308Z' };

    await processTrigger.call(emitter, {}, cfg, snapshot);
    expect(emitter.emit.calledTwice).to.be.equal(true);
    expect(emitter.emit.firstCall.args[1].body).to.deep.equal({
      userId: 5,
      id: 45,
      title: 'ut numquam possimus omnis eius suscipit laudantium iure',
      body: 'est natus reiciendis nihil possimus aut provident',
      created: new Date('2019-12-03T11:20:32.637Z'),
      lastModified: '2019-12-03T11:20:32.637Z',
    });
    expect(emitter.emit.secondCall.args[1]).to.deep.equal({
      startTime: '2019-12-03T11:20:32.637Z',
    });
  });
});

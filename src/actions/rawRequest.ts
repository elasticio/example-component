import { messages } from 'elasticio-node';

export async function processAction(msg, cfg, snapshot) {
  this.logger.info(`snapshot: ${JSON.stringify(snapshot || {})}`);
  const newSnapshot = { currentTime: new Date() };
  await this.emit('snapshot', newSnapshot);
  this.logger.info('newSnapshot is done');
  return messages.newMessageWithBody({});
}

export const getMetaModel = async function getMetaModel(cfg) {
  const inMeta = {
    type: 'object',
    properties: {
      'Some Objec': {
        type: 'object',
        help: { description: 'Object description' },
        properties: {
          'Some Obj key': {
            type: 'string',
            help: { description: 'Key description' }
          }
        }
      }
    }
  };

  return { in: inMeta, out: {}, };
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;

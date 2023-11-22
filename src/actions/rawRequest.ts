import { messages } from 'elasticio-node';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  this.logger.info('request is done, emitting...');
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

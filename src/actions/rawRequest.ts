import { messages } from 'elasticio-node';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  this.logger.info('request is done, emitting...');
  return messages.newMessageWithBody({});
}

export const getMetaModel = async function getMetaModel(cfg) {
  const outMeta = {
    properties: {
      salesChannel: {
        type: 'array',
        items: {
          type: 'object',
          properties: {}
        }
      }
    },
    type: 'object'
  };
  if (cfg.deadMeta) delete outMeta.properties.salesChannel.items.properties;

  return { in: outMeta, out: {}, };
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;

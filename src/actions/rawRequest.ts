import { messages } from 'elasticio-node';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  const { configData } = cfg;
  return messages.newMessageWithBody(msg.body);
}

export const getMetaModel = async function getMetaModel(cfg) {
  const { configData } = cfg;
  const inMeta = JSON.parse(configData);
  return {
    in: inMeta,
    our: {}
  };
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;

import { messages } from 'elasticio-node';

export async function processAction(msg, cfg, snapshot) {
  return messages.newMessageWithBody({ selected: cfg.dynamicFields });
}

export const getMetaModel = async function getMetaModel(cfg) {
  return { in: {}, out: {}, };
};

export const getDynamicFields = async function getDynamicFields(cfg) {
  const { cfgForDynamicFields } = cfg;
  return JSON.parse(cfgForDynamicFields);
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;
module.exports.getDynamicFields = getDynamicFields;

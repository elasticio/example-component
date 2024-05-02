import { messages } from 'elasticio-node';

const msgStor = [];

export async function processAction(msg, cfg, snapshot) {
  msgStor.push(msg.body);

  return messages.newMessageWithBody({ msgStor });
}

export const getMetaModel = async function getMetaModel(cfg) {
  return {
    in: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          required: true,
          title: 'Method',
        }
      }
    },
    out: {},
  };
};

export const getDynamicFields = async function getDynamicFields(cfg) {
  const { cfgForDynamicFields } = cfg;
  return JSON.parse(cfgForDynamicFields);
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;
module.exports.getDynamicFields = getDynamicFields;

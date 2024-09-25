import { messages } from 'elasticio-node';

const msgStor = [];

function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

export async function processAction(msg, cfg, snapshot) {
  msgStor.push(msg.body);
  await sleep(5000);
  await this.emit('data', messages.newMessageWithBody({ msgStor }));
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
    out: {
      type: 'object',
      properties: {
        method: {
          type: 'string',
          required: true,
          title: 'Method',
        }
      }
    },
  };
};

export const getList = async function getList(cfg) {
  return {
    latest: 'Use latest',
    exactMatch: 'Exact match',
    exactMatchOrLast: 'Exact match or latest'
  };
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;
module.exports.getList = getList;

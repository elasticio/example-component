import { messages } from 'elasticio-node';
import Client from '../Client';

let client: Client;

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Lookup Object (at most one)" action started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);

  const { objectType, lookupCriteria } = cfg;
  const { lookupCriteriaValue } = msg.body;
  if (!lookupCriteriaValue) {
    if (cfg.allowCriteriaToBeOmitted) {
      return messages.newEmptyMessage();
    }
    throw new Error('No "Lookup Criteria Value" provided!');
  }

  const url = `/${objectType}/${lookupCriteria}/${lookupCriteriaValue}`;
  let result;
  try {
    result = (await client.apiRequest({
      method: 'GET',
      url,
    })).data;
  } catch (error) {
    if (error.response?.status === 404) {
      this.logger.info('Request failed with 404, continue...');
    } else {
      throw error;
    }
  }

  if (result) {
    return messages.newMessageWithBody(result);
  }
  if (cfg.allowZeroResults) {
    return messages.newEmptyMessage();
  }
  throw Error('No object found!');
}

export async function getLookupCriteriaModel(cfg: { objectType: string }) {
  const model: any = {};
  switch (cfg.objectType) {
    case 'products':
      model.sku = 'Product SKU';
      model.sellerId = 'Seller ID';
      break;
    case 'users':
      model.id = 'User ID';
      model.email = 'User Email';
      break;
    default:
      throw new Error(`Object Type "${cfg.objectType}" is not supported!`);
  }
  return model;
}

export async function getMetaModel(cfg: { allowCriteriaToBeOmitted: boolean }) {
  const meta = {
    in: {
      type: 'object',
      properties: {
        lookupCriteriaValue: {
          type: 'string',
          required: true,
          title: 'Lookup Criteria Value',
        },
      },
    },
    out: {
      type: 'object',
      properties: {},
    },
  };

  if (cfg.allowCriteriaToBeOmitted) {
    meta.in.properties.lookupCriteriaValue.required = false;
  }

  return meta;
}

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;

import { messages } from 'elasticio-node';
import Client from '../client';

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Lookup Object (at most one)" action started');
  const client = new Client(this, cfg);
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
      console.log('Request failed with 404, continue...');
    } else {
      throw error;
    }
  }

  if (result) {
    return messages.newMessageWithBody({ result });
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

module.exports.process = processAction;

import { messages } from 'elasticio-node';
import Client from '../Client';

let client: Client;

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Delete Object" action started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);

  const { objectType, lookupCriteria } = cfg;
  const { lookupCriteriaValue } = msg.body;
  if (!lookupCriteriaValue) {
    throw new Error('No "Lookup Criteria Value" provided!');
  }

  const url = `/${objectType}/${lookupCriteria}/${lookupCriteriaValue}`;
  const { data } = await client.apiRequest({
    method: 'DELETE',
    url,
  });

  this.logger.info('"Delete Object" action is done, emitting...');
  return messages.newMessageWithBody(data);
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

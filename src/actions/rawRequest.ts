import { messages } from 'elasticio-node';
import Client from '../client';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  const client = new Client(this, cfg);
  const { url, method, data } = msg.body;
  const response = await client.apiRequest({ url, method, data });
  this.logger.info('request is done, emitting...');
  return messages.newMessageWithBody({
    statusCode: response.status,
    headers: response.headers,
    responseBody: response.data
  });
}

module.exports.process = processAction;

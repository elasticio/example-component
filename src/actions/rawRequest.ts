import { messages } from 'elasticio-node';
import ExampleClient from '../client';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  const client = new ExampleClient(this, cfg);
  const { url, method, data } = msg.body;
  this.logger.info('making request...');
  const response = await client.apiRequest({
    url,
    method,
    data,
  });
  this.logger.info('request is done, emitting...');
  return messages.newMessageWithBody({
    statusCode: response.status,
    headers: response.headers,
    responseBody: response.data
  });
}

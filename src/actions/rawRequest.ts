import { messages } from 'elasticio-node';
import Client from '../client';
import inSchema from '../schemas/actions/rawRequest.in.json';

const allowedMethods = inSchema.properties.method.enum;

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  const client = new Client(this, cfg);
  const { url, method, data } = msg.body;
  if (!allowedMethods.includes(method)) {
    throw new Error(`Method "${method}" is not supported! Supported methods are: ${JSON.stringify(allowedMethods)}`);
  }
  const response = await client.apiRequest({ url, method, data });
  this.logger.info('request is done, emitting...');
  return messages.newMessageWithBody({
    statusCode: response.status,
    headers: response.headers,
    responseBody: response.data
  });
}

module.exports.process = processAction;

import { messages } from 'elasticio-node';
import * as commons from '@elastic.io/component-commons-library';
import Client from '../Client';
import inSchema from '../schemas/actions/makeRawRequest.in.json';

let client: Client;

const allowedMethods = inSchema.properties.method.enum;

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');

  client ||= new Client(this, cfg);
  client.setLogger(this.logger);

  const { url, method, data } = msg.body;
  if (!allowedMethods.includes(method)) {
    throw new Error(`Method "${method}" is not supported! Supported methods are: ${JSON.stringify(allowedMethods)}`);
  }

  let response;
  try {
    response = await client.apiRequest({ url, method, data });
  } catch (err) {
    if (err.response) throw new Error(commons.getErrMsg(err.response));
    throw err;
  }
  this.logger.info('request is done, emitting...');
  return messages.newMessageWithBody({
    statusCode: response.status,
    headers: response.headers,
    responseBody: response.data
  });
}

module.exports.process = processAction;

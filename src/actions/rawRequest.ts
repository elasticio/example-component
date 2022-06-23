import { messages } from 'elasticio-node';
import Client from '../client';

export async function processAction(msg, cfg) {
  this.logger.info('"Make Raw Request" action started');
  const client = new Client(this, cfg);
  const { url, method, data } = msg.body;
  let response;
  try {
    response = await client.apiRequest({ url, method, data });
  } catch (err) {
    this.logger.error(`Got error "${err.response.statusText}", status - ${err.response.status}, body: ${JSON.stringify(err.response.data)}`);
    if (err.response.status === 404 && cfg.doNotThrow404) {
      return messages.newMessageWithBody({ statusCode: 404 });
    }
    throw new Error(`Got error "${err.response.statusText}", status "${err.response.status}, body: "${JSON.stringify(err.response.data)}"`);
  }
  this.logger.info('request is done, emitting...');
  return messages.newMessageWithBody({
    statusCode: response.status,
    headers: response.headers,
    responseBody: response.data
  });
}

module.exports.process = processAction;

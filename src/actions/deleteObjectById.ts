import { messages } from 'elasticio-node';
import Client from '../Client';

let client: Client;

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Delete Object By ID" action started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);

  const { objectType } = cfg;
  const { idValue } = msg.body;
  if (!idValue) {
    throw new Error('No "ID Value" provided!');
  }

  const url = `/${objectType}/${idValue}`;
  const { data } = await client.apiRequest({
    method: 'DELETE',
    url,
  });
  this.logger.info('"Delete Object By ID" action is done, emitting...');
  return messages.newMessageWithBody(data);
}

module.exports.process = processAction;

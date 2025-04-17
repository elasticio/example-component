import { messages } from 'elasticio-node';

export async function processTrigger(msg: any, cfg: any) {
  this.logger.info('"Webhook" trigger started');

  const reply = messages.newMessageWithBody(msg.body || {});
  reply.headers['X-EIO-Routing-Key'] = msg.headers.reply_to;
  reply.headers['Content-Type'] = 'application/json';
  reply.headers['x-eio-status-code'] = 200;
  await this.emit('data', reply);

  this.logger.info('"Webhook" trigger is done');
}

module.exports.process = processTrigger;

const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleServiceLogicClient');

exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const { url, method, body } = msg.body;

  this.logger.info('Making Raw request...');
  const responseBody = await client.makeRequest({
    url,
    method,
    body,
  });
  this.logger.info('Request complete.');


  await this.emit('data', messages.newMessageWithBody({
    responseBody,
  }));
};

const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleServiceLogicClient');

exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const { url, method, body } = msg.body;

  const responseBody = await client.makeRequest({
    url,
    method,
    body,
  });


  await this.emit('data', messages.newMessageWithBody({
    responseBody,
  }));
};

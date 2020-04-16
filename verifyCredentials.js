const ExampleClient = require('./lib/exampleClient');

module.exports = async function verify(credentials, callback) {
  try {
    const client = new ExampleClient(this, credentials);
    await client.makeRequest({
      url: 'posts/1',
      method: 'GET',
    });

    this.logger.info('Verification succeeded');
    callback(null, { verified: true });
  } catch (err) {
    this.logger.error('Verification failed');
    this.logger.error(err);
    throw err;
  }
};

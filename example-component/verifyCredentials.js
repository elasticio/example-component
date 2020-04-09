const Client = require('./lib/ExampleComponentClient');

module.exports = async function verify(cfg, callback) {
  try {
    const client = new Client(cfg);
    const requestOptions = {};
    await client.makeRequest(requestOptions);

    this.logger.info('Verification succeeded');
    callback(null, { verified: true });
  } catch (err) {
    this.logger.error('Verification failed');
    this.logger.error(err);
    callback(err, { verified: false });
  }
};

const { expect } = require('chai');
const sinon = require('sinon');
const verify = require('../verifyCredentials.js');
const fs = require('fs');

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

// mock values for the credentials (configuration) fields
const credentials = {
  url: process.env.API_BASE_URI,
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};

// a mocked 'this' value for the function
const emitter = { logger: { trace: () => {} } };

describe('Verify Credentials integration tests', () => {
  it('should succeed with the correct credentials', async () => {
    await verify.call(emitter, credentials, (err, data) => {
      expect(err).to.eq(null);
      expect(data.verified).to.eq(true);
    });
  });

  it('should fail with incorrect credentials', async () => {
    credentials.password = 'wrong!!';

    await verify.call(emitter, credentials, (err, data) => {
      expect(err).to.not.eq(null);
      expect(data.verified).to.eq(false);
    });
  });
});

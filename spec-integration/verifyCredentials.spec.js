/* eslint-disable no-unused-expressions */
const chai = require('chai');
const fs = require('fs');
const logger = require('@elastic.io/component-logger')();
const verify = require('../verifyCredentials.js');

const { expect } = chai;
chai.use(require('chai-as-promised'));

if (fs.existsSync('.env')) {
  // eslint-disable-next-line global-require
  require('dotenv').config();
}

// mock values for the credentials (configuration) fields
const credentials = {
  url: process.env.API_BASE_URI,
  username: process.env.UNAME,
  password: process.env.PASS,
};

const emitter = { logger };

describe('Verify Credentials integration tests', () => {
  it('should succeed with the correct credentials', async () => {
    await verify.call(emitter, credentials, (err, data) => {
      expect(err).to.eq(null);
      expect(data.verified).to.eq(true);
    });
  });

  it('should fail with incorrect credentials', async () => {
    credentials.password = 'wrong!!';
    await expect(verify.call(emitter, credentials, (err, data) => {
      expect(err).to.not.eq(null);
      expect(data.verified).to.eq(false);
    })).to.eventually.be.rejected;
  });
});

/* eslint-disable max-len */
/* eslint-disable import/first */
process.env.LOG_LEVEL = 'TRACE';
process.env.LOG_OUTPUT_MODE = 'short';
import getLogger from '@elastic.io/component-logger';
import sinon from 'sinon';
import { existsSync } from 'fs';
import { config } from 'dotenv';

if (existsSync('.env')) {
  config();
  const {
    API_BASE_URI, UNAME, PASSWORD
  } = process.env;
  if (!API_BASE_URI || !UNAME || !PASSWORD) {
    throw new Error('Please, provide all environment variables');
  }
} else {
  throw new Error('Please, provide environment variables to .env');
}
const { API_BASE_URI, UNAME, PASSWORD } = process.env;

export const creds = {
  api_url: API_BASE_URI,
  username: UNAME,
  password: PASSWORD,
};

export const getContext = () => ({
  logger: getLogger(),
  emit: sinon.spy(),
});

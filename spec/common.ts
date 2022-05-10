/* eslint-disable import/first */
process.env.LOG_LEVEL = 'TRACE';
process.env.LOG_OUTPUT_MODE = 'short';
import getLogger from '@elastic.io/component-logger';
import sinon from 'sinon';

export const getContext = () => ({
  logger: getLogger(),
  emit: sinon.spy(),
});
const { expect } = require('chai');
const bunyan = require('bunyan');
const <%- componentTitlePascal %>Client = require('../lib/<%- componentTitle %>Client');

const cfg = {};

const emitter = { logger: bunyan.createLogger({ name: 'dummy' }) };

describe('<%- componentTitlePascal %> Client', () => {

});

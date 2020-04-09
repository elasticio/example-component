const { BasicAuthRestClient } = require('@elastic.io/component-commons-library');
const { promisify } = require('util');
const request = promisify(require('request'));

module.exports = class ExampleComponentClient extends BasicAuthRestClient {

};

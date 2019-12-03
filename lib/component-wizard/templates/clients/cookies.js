const { CookieRestClient } = require('@elastic.io/component-commons-library');
const { promisify } = require('util');
const request = promisify(require('request'));

module.exports = class <%- componentTitlePascal %>Client extends CookieRestClient {

};

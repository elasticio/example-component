const { OAuth2RestClient } = require('@elastic.io/component-commons-library');
const { promisify } = require('util');
const request = promisify(require('request'));

module.exports = class <%- componentTitlePascal %>Client extends OAuth2RestClient {

};

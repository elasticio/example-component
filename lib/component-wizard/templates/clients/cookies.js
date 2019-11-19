const { CookieRestClient } = require('@elastic.io/component-commons-library');
const { promisify } = require('util');
const request = promisify(require('request'));
const removeTrailingSlash = require('remove-trailing-slash');
const removeLeadingSlash = require('remove-leading-slash');

module.exports = class <%- componentNamePascal %>Client extends CookieRestClient { };

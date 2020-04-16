/* eslint-disable no-param-reassign, no-underscore-dangle */
const { NoAuthRestClient } = require('@elastic.io/component-commons-library');
const logger = require('@elastic.io/component-logger')();
const { promisify } = require('util');
const request = promisify(require('request'));
const removeTrailingSlash = require('remove-trailing-slash');
const removeLeadingSlash = require('remove-leading-slash');

// This client inherits from the NoAuthRestClient, defined in the component commons library:
// https://github.com/elasticio/component-commons-library
module.exports = class ExampleComponentClient extends NoAuthRestClient {
  // The server uses JWT Authentication for all api calls.
  constructor(emitter, cfg) {
    super(emitter, cfg);
    // the cfg object stores the values from the credentials fields (see component.json)
    this.cfg = cfg;
    this.cfg.resourceServerUrl = cfg.url;
    this.authRestClient = new NoAuthRestClient(emitter, cfg);
  }

  async _fetchNewToken() {
    const url = 'auth/newtoken';
    const { username, password } = this.cfg;
    // may need to check whether authentication token is received in the right format
    const authToken = await this.authRestClient.makeRequest({
      url,
      method: 'POST',
      body: {
        username,
        password,
      },
    });
    console.log(authToken);
    if (!authToken) {
      throw new Error('Could not fetch token, please verify your credentials');
    }
    logger.info('New token fetched...');
    return authToken.trim();
  }

  async addAuthTokenToRequestOptions(requestOptions) {
    const authToken = await this._fetchNewToken();
    console.log("run", authToken);
    requestOptions.headers.Authorization = `Bearer ${authToken}`;
  }

  /* eslint-disable class-methods-use-this */
  async handleRestResponse(response) {
    if (response.statusCode >= 400) {
      if (typeof (response.body) === 'object' && response.body.message) {
        const errorMessage = response.body.message;
        // check that this works (probably doesn't):
        const endpoint = response.request.uri.href;
        throw new Error(`Error in making request to ${endpoint} Status code: ${response.statusCode} Message: ${errorMessage}`);
      }
    }
    logger.info(`Response statusCode: ${response.statusCode}, body: ${response.body}`);
    return response.body;
  }

  // the function called by actions and triggers when making an API request
  // an override of the default function in NoAuthRestClient
  async makeRequest(options) {
    const {
      url, method, body, headers = {}, urlIsSegment = true, isJson = true, responseHandler,
    } = options;
    const urlToCall = urlIsSegment
      ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(url.trim())}` // Trim trailing or leading '/'
      : url.trim();

    this.emitter.logger.trace(`Making ${method} request to ${urlToCall} with body: %j ...`, body);

    const requestOptions = {
      method,
      body,
      headers,
      url: urlToCall,
      json: isJson,
    };

    console.log("mr1")
    await this.addAuthenticationToRequestOptions(requestOptions);
    console.log("mr2")
    const response = await request(requestOptions);

    // may not need this, depending on whether it's used in the actions/triggers
    if (responseHandler) {
      return responseHandler(response, this.handleRestResponse);
    }

    return this.handleRestResponse(response);
  }
};

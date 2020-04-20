/* eslint-disable no-param-reassign, no-underscore-dangle */
const { BasicAuthRestClient } = require('@elastic.io/component-commons-library');
const { promisify } = require('util');
const request = promisify(require('request'));
const removeTrailingSlash = require('remove-trailing-slash');
const removeLeadingSlash = require('remove-leading-slash');

// This client inherits from the BasicAuthRestClient, defined in the component commons library:
// https://github.com/elasticio/component-commons-library
module.exports = class ExampleComponentClient extends BasicAuthRestClient {
  // The server uses Basic Authentication for all api calls.
  constructor(emitter, cfg) {
    super(emitter, cfg);
    // the cfg object stores the values from the credentials fields (see component.json)
    this.cfg = cfg;
    this.username = cfg.username;
    this.password = cfg.password;
    this.cfg.resourceServerUrl = cfg.url;
    this.authRestClient = new BasicAuthRestClient(emitter, cfg);
  }

  // the function called by BasicAuthRestClient.makeRequest() when handling responses
  // an override of the default class method to allow for custom handling of 404 Resource Not Found messages
  async handleRestResponse(response) {
    if (response.statusCode >= 400) {
      // a special case of a 404 response which should not throw an error since it is usually a
      // response from the server when searching for a resource (such as in the upsert action).
      if (response.statusCode === 404 && response.body.message === 'Could not find requested resource') {
        return response.body.message;
      }
      throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
    }

    this.emitter.logger.trace(`Response statusCode: ${response.statusCode}, body: %j`, response.body);
    return response.body;
  }

  // the function called by actions and triggers when making an API request
  // an override of the default function in BasicAuthRestClient to allow for custom responseHandlers
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

    // inherited from BasicAuthRestClient
    await this.addAuthenticationToRequestOptions(requestOptions);

    const response = await request(requestOptions);

    if (responseHandler) {
      return responseHandler(response, this.handleRestResponse);
    }

    return this.handleRestResponse(response);
  }
};

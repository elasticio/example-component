/* eslint-disable no-param-reassign, no-underscore-dangle */
const { BasicAuthRestClient } = require('@elastic.io/component-commons-library');

// This client inherits from the BasicAuthRestClient, defined in the component commons library:
// https://github.com/elasticio/component-commons-library
module.exports = class ExampleClient extends BasicAuthRestClient {
  // The server uses Basic Authentication for all api calls.
  constructor(emitter, cfg) {
    super(emitter, cfg);
    this.cfg.resourceServerUrl = cfg.url;
  }

  // The function called by BasicAuthRestClient.makeRequest() when handling responses.
  // An override of the default class method to allow for custom handling of
  // 404 Resource Not Found messages
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
};

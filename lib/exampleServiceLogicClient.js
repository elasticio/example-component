const ExampleClient = require('./exampleClient');

/**
 * The ExampleServiceLogicClient class contains helper functions for
 * loading schemas for common config fields and metadata.
 */

module.exports = class ExampleServiceLogicClient extends ExampleClient {
  /**
   * Returns the description of the object type from the API
   */

  async getObjectAttributes(objectType) {
    return this.makeRequest({
      url: `${objectType}/attributes`,
      method: 'GET',
    });
  }

  /**
   * Returns a list of the unique identifier fields of the object that will be upserted.
   */

  async getUniqueFieldsModel(objectType) {
    const description = await this.getObjectAttributes(objectType);

    const model = Object.keys(description)
      .reduce((obj, attr) => {
        if (description[attr].unique) {
          // eslint-disable-next-line no-param-reassign
          obj[attr] = description[attr].title;
        }
        return obj;
      }, {});

    return model;
  }
};

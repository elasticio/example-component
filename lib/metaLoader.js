const ExampleClient = require('./exampleClient');

/**
 * The MetaLoader class contains helper functions for
 * loading schemas for common config fields and metadata.
 */

module.exports = class MetaLoader {
  constructor(emitter, cfg) {
    this.cfg = cfg;
    this.emitter = emitter;
    this.client = new ExampleClient(emitter, cfg);
  }

  /**
   * Returns the description of the object type from the API
   */
  async getObjectAttributes() {
    const { objectType } = this.cfg;
    const description = await this.client.makeRequest({
      url: `${objectType}/attributes`,
      method: 'GET',
    });
    return description;
  }

  /**
   * Returns a list of the unique identifier fields of the object that will be upserted.
   */

  async getUniqueFieldsModel() {
    const description = await this.getObjectAttributes();

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

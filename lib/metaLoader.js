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
   * General helper functions
   */

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
   * Config Field Schemas
   */

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

  /**
   * Some actions have a configuration field linkedObjectsToPopulate.
   * The entries for this field depend on the objectType selection,
   * which is used to create a model for all child and parent objects
   * in this function. See example server documentation for the object
   * relationship API: https://github.com/elasticio/example-service.
   */
  async getLinkedObjectsModel() {
    const relationships = await this.client.makeRequest({
      url: `${this.cfg.objectType}/relationships`,
      method: 'GET',
    });

    return {
      ...relationships.children,
      ...relationships.parents,
    };
  }
};

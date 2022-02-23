/* eslint-disable class-methods-use-this */
import axios, { AxiosRequestConfig } from 'axios';

export default class Client {
  private logger: any;

  private cfg: any;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
  }

  async apiRequest(opts: AxiosRequestConfig) {
    return axios.request(opts);
  }

  /**
   * General helper functions
   */

  /**
   * Returns the description of the object type from the API
   */

  async getObjectAttributes(objectType) {
    return this.apiRequest({
      url: `${objectType}/attributes`,
      method: 'GET',
    });
  }

  /**
   * Config Field Schemas
   */

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

  /**
   * Some actions have a configuration field linkedObjectsToPopulate.
   * The entries for this field depend on the objectType selection,
   * which is used to create a model for all child and parent objects
   * in this function. See example server documentation for the object
   * relationship API: https://github.com/elasticio/example-service.
   */
  async getLinkedObjectsModel(objectType) {
    const relationships = await this.apiRequest({
      url: `${objectType}/relationships`,
      method: 'GET',
    });

    return {
      ...relationships.data.children,
      ...relationships.data.parents,
    };
  }
}

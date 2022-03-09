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

  async getObjectAttributes(objectType) {
    return this.apiRequest({
      url: `${objectType}/attributes`,
      method: 'GET',
    });
  }

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

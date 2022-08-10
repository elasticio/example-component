/* eslint-disable no-restricted-syntax, class-methods-use-this */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { axiosReqWithRetryOnServerError } from '@elastic.io/component-commons-library/src/externalApi';

export default class Client {
  private logger: any;

  private cfg: any;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
  }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosReqWithRetryOnServerError.call(this, opts);
  }
}

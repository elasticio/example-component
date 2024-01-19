/* eslint-disable no-restricted-syntax, class-methods-use-this */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { axiosReqWithRetryOnServerError } from '@elastic.io/component-commons-library';

export default class Client {
  private logger: any;

  private cfg: any;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
  }

  setLogger(logger) { this.logger = logger; }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    return axiosReqWithRetryOnServerError.call(this, opts);
  }
}

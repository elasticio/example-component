/* eslint-disable class-methods-use-this */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export default class Client {
  private logger: any;

  private cfg: any;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
  }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios.request(opts);
  }
}

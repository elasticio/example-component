/* eslint-disable no-restricted-syntax, class-methods-use-this */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as commons from '@elastic.io/component-commons-library';

const API_BASE_URL = 'https://example.com/v1/';
const MAXIMUM_4XX_ERRORS_RETRIES = 5;

export default class Client {
  private logger: any;

  private cfg: any;

  private retries: number;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
    this.retries = MAXIMUM_4XX_ERRORS_RETRIES;
  }

  setLogger(logger) { this.logger = logger; }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    opts = {
      ...opts,
      baseURL: API_BASE_URL,
      headers: {
        ...opts.headers || {},
        Authorization: `Custom ${this.cfg.username}:${this.cfg.password}`
      }
    };
    let response;
    let error;
    let currentRetry = 0;

    while (currentRetry <= this.retries) {
      try {
        response = await commons.axiosReqWithRetryOnServerError.call(this, opts);
        return response;
      } catch (err) {
        error = err;
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers['retry-after'] || 2 ** (currentRetry + 1);
          this.logger.error(`Going to retry after ${retryAfter}sec (${currentRetry + 1} of ${this.retries})`);
          await commons.sleep(retryAfter * 1000);
        } else {
          throw err;
        }
      }
      currentRetry++;
    }
    throw error;
  }
}

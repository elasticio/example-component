/* eslint-disable no-restricted-syntax, class-methods-use-this */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_RETRIES_COUNT = process.env.API_RETRIES_COUNT ? parseInt(process.env.API_RETRIES_COUNT, 10) : 3;
const API_RETRY_DELAY = process.env.API_RETRY_DELAY ? parseInt(process.env.API_RETRY_DELAY, 10) : 10000;
const API_REQUEST_TIMEOUT = process.env.API_REQUEST_TIMEOUT ? parseInt(process.env.API_REQUEST_TIMEOUT, 10) : 15000;

export const sleep = async (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const getErrMsg = (errResponse) => {
  const statusText = errResponse?.statusText || 'unknown';
  const status = errResponse?.status || 'unknown';
  const data = errResponse?.data || 'no body found';
  return `Got error "${statusText}", status - "${status}", body: ${JSON.stringify(data)}`;
};

export default class Client {
  private logger: any;

  private cfg: any;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
  }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    let response;
    let currentRetry = 0;
    let error;
    while (currentRetry < API_RETRIES_COUNT) {
      try {
        response = await axios.request({
          ...opts,
          timeout: API_REQUEST_TIMEOUT,
          validateStatus: (status) => (status >= 200 && status < 300) || (status === 404 && this.cfg.doNotThrow404)
        });
        return response;
      } catch (err) {
        error = err;
        if (err.response?.status < 500) {
          throw new Error(getErrMsg(err.response));
        }
        this.logger.info('Error message: ', err.message);
        this.logger.error(getErrMsg(err.response));
        this.logger.info(`Request failed, retrying (${1 + currentRetry})`);
        await sleep(API_RETRY_DELAY);
        currentRetry++;
      }
    }
    throw new Error(error.message);
  }
}

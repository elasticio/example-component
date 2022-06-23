/* eslint-disable no-restricted-syntax, class-methods-use-this */
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const RETRIES_COUNT = 3;
const RETRY_DELAY = 10000;
const REQUEST_TIMEOUT = 15000;

export const sleep = async (ms: number) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const getErrMsg = (errResponse = {}) => {
  // @ts-ignore
  const { statusText = 'unknown', status = 'unknown', data = 'no body found' } = errResponse;
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
    while (currentRetry < RETRIES_COUNT) {
      try {
        response = await axios.request({
          ...opts,
          timeout: REQUEST_TIMEOUT,
          validateStatus: (status) => status < 500
        });
      } catch (err) {
        this.logger.debug('Error to JSON: ', err.toJSON());
        this.logger.debug('Error message: ', err.message);
        this.logger.error(getErrMsg(err.response));
        this.logger.info(`Request failed, retrying (${1 + currentRetry})`);
        await sleep(RETRY_DELAY);
        currentRetry++;
      }
    }
    return response;
  }
}

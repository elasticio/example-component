import { messages } from 'elasticio-node';
import * as commons from '@elastic.io/component-commons-library';
import Client from '../Client';
import {
  isNumberNaN,
  timestamp,
  isDateValid,
  timeToString
} from '../utils';

let client: Client;
const isDebugFlow = process.env.ELASTICIO_FLOW_TYPE === 'debug';
const maxPageSize = isDebugFlow ? 10 : 100;

export async function processTrigger(msg, cfg, snapshot) {
  this.logger.info('"Get New and Updated Objects" trigger started');
  client ||= new Client(this, cfg);
  client.setLogger(this.logger);

  const currentTime = new Date();
  const {
    objectType,
    startTime,
    endTime,
    pollConfig = 'lastModified',
    emitBehavior = 'emitIndividually'
  } = cfg;

  let { pageSize = 100 } = cfg;
  if (!pageSize) pageSize = maxPageSize;
  if (pageSize > maxPageSize && isDebugFlow && pageSize <= 100) pageSize = maxPageSize;

  if (startTime && !isDateValid(startTime)) throw new Error('invalid "Start Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ');
  if (endTime && !isDateValid(endTime)) throw new Error('invalid "End Time" date format, use ISO 8601 Date time utc format - YYYY-MM-DDThh:mm:ssZ');
  if (isNumberNaN(pageSize) || Number(pageSize) <= 0 || Number(pageSize) > 500) throw new Error('"Size of Polling Page" must be valid number between 1 and 500');
  if (startTime && endTime && startTime > endTime) throw new Error('"Start Time" should be less or equal to "End Time"');

  const from = snapshot?.nextStartTime || startTime || 0;
  const to = timestamp(endTime || currentTime) > timestamp(currentTime) ? currentTime : endTime || currentTime;

  if (timestamp(from) > timestamp(to)) throw new Error('Flow reached "End Time". No data can be found for the selected dates');
  this.logger.info(`Will collect ${objectType} where ${pollConfig} between ${timeToString(from)} and ${timeToString(to)}} (UTC) fetching ${pageSize} records per request`);

  const params: any = {
    skip: 0,
    limit: pageSize,
    filter: `${pollConfig}>=${from} and ${pollConfig}<${to}`
  };

  let iteration = 1;
  let emitted;
  let cursor;

  do {
    let result;
    try {
      result = await client.apiRequest({
        url: `${objectType}/search`,
        method: 'GET',
        params
      });
    } catch (err) {
      if (err.response) throw new Error(commons.getErrMsg(err.response));
      throw err;
    }
    const { items = [], next_cursor } = result;
    this.logger.info(`Polling iteration ${iteration} - ${items.length} items found`);
    cursor = next_cursor;
    iteration++;
    if (items.length !== 0) {
      emitted = true;
      if (emitBehavior === 'emitIndividually') {
        for (const item of items) {
          await this.emit('data', messages.newMessageWithBody(item));
        }
      }
      if (emitBehavior === 'emitPage') {
        await this.emit('data', messages.newMessageWithBody({ results: items }));
      }
    }
  } while (isDebugFlow ? false : cursor);

  if (isDebugFlow && !emitted) {
    throw new Error(`No object found. Execution stopped.
    This error is only applicable to the Retrieve Sample.
    In flow executions there will be no error, just an execution skip.`);
  }

  this.logger.info('"Get New and Updated Objects" action is done');
}

module.exports.process = processTrigger;

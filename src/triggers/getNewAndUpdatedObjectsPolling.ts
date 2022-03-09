import { messages } from 'elasticio-node';
import Client from '../client';

export async function processTrigger(msg, cfg, snapshot = {
  startTime: undefined
}) {
  this.logger.info('"Get New and Updated Objects" trigger started');
  const client = new Client(this, cfg);
  const {
    objectType,
    startTime,
    endTime,
    pollConfig = 'lastModified',
  } = cfg;

  const pollingStartTime = new Date(snapshot.startTime || startTime || 0);
  const pollingEndTime = new Date(endTime || 8640000000000000);

  this.logger.info(`Will poll for changes between ${pollingStartTime.toISOString()} and ${pollingEndTime.toISOString()} ...`);

  const queryString = `${encodeURIComponent(objectType)}?_sort=${pollConfig}&_order=asc`;
  const resultsList = await client.apiRequest({
    url: queryString,
    method: 'GET',
  });

  const filteredResults = resultsList.data.map((obj) => {
    obj[pollConfig] = new Date(obj[pollConfig]);
    return obj;
  }).filter((obj) => (snapshot.startTime
    ? obj[pollConfig] > pollingStartTime && obj[pollConfig] <= pollingEndTime
    : obj[pollConfig] >= pollingStartTime && obj[pollConfig] <= pollingEndTime));

  this.logger.info(`Found ${filteredResults.length} changed objects...`);

  // eslint-disable-next-line no-restricted-syntax
  for (const result of filteredResults) {
    await this.emit('data', messages.newMessageWithBody(result));
  }

  snapshot = {
    startTime: filteredResults[filteredResults.length - 1][pollConfig].toISOString(),
  };
  await this.emit('snapshot', snapshot);

  this.logger.info(`Polling complete. Future snapshot set to ${snapshot.startTime}`);
}

module.exports.process = processTrigger;

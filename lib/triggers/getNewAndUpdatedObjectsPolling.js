/* eslint-disable no-param-reassign */
const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');

/**
 * This trigger uses the Get New and Updated Objects Polling design pattern in the OIH standard:
 * https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#upsert-object
 * @param cfg is the values for the configuration fields of the trigger
 * @param snapshot holds the time of the last emitted object
 * The msg parameter is not used since there is no input metadata
 * This trigger does not implement pagination. It can be extended to support this by following
 * the specification in the OIH Standard, linked above.
 */

exports.process = async function process(msg, cfg, snapshot = {}) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    startTime,
    endTime,
    pollConfig = 'lastModified',
  } = cfg;

  // convert the start and end times into Date() objects
  // if there is a snapshot, use its startTime instead of the configuration time
  // to avoid emitting objects that have already been updated in later executions
  const pollingStartTime = new Date(snapshot.startTime || startTime || 0);
  const pollingEndTime = new Date(endTime || 8640000000000000); // the latest time possible

  this.logger.info(`Will poll for changes between ${pollingStartTime.toISOString()} and ${pollingEndTime.toISOString()} ...`);

  // retrieve a list of objects, ordered from earliest to latest
  const queryString = `${encodeURIComponent(objectType)}?_sort=${pollConfig}&_order=asc`;
  // due to API limitations, filtering of results to only be within
  // the start and end times must happen after the query.
  const resultsList = await client.makeRequest({
    url: queryString,
    method: 'GET',
  });

  // convert all the date values in resultsList to Date() objects,
  // then filter resultsList to only include objs modified/created within
  // pollingStartTime and pollingEndTime inclusive.
  const filteredResults = resultsList.map((obj) => {
    obj[pollConfig] = new Date(obj[pollConfig]);
    return obj;
  }).filter((obj) => (snapshot.startTime
    ? obj[pollConfig] > pollingStartTime && obj[pollConfig] <= pollingEndTime
    : obj[pollConfig] >= pollingStartTime && obj[pollConfig] <= pollingEndTime));

  this.logger.info(`Found ${filteredResults.length} changed objects...`);

  // a for loop must be used instead of a .forEach() call because
  // of a known issue with calling emit() in forEach loops:
  // https://github.com/elasticio/splitter-component/issues/35
  // eslint-disable-next-line no-restricted-syntax
  for (const result of filteredResults) {
    // now that we have our list, emit all the values.
    // When date objects are emitted, they are automatically put into ISO8601 format.
    // eslint-disable-next-line no-await-in-loop
    await this.emit('data', messages.newMessageWithBody(result));
  }

  // set the startTime of the snapshot
  snapshot = {
    startTime: filteredResults[filteredResults.length - 1][pollConfig].toISOString(),
  };
  await this.emit('snapshot', snapshot);

  this.logger.info(`Polling complete. Future snapshot set to ${snapshot.startTime}`);
};

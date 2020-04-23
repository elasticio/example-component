/* eslint-disable no-param-reassign */
const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const ExampleServiceLogicClient = require('../exampleServiceLogicClient');

/**
 * This trigger uses the Get New and Updated Objects Polling design pattern in the OIH standard:
 * https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#upsert-object
 * @param cfg is the values for the configuration fields of the trigger
 * The msg parameter is not used since there is no input metadata
 * This trigger does not implement pagination. It can be extended to support this by following
 * the specification in the OIH Standard, linked above.
 */

exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    startTime = '1970-01-01T00:00:00.000Z',
    endTime,
    pollConfig = 'updatedTime',
  } = cfg;

  console.log('run');

  // validate the input date strings
  const dateRegExp = new RegExp('^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$');
  if ((startTime && !dateRegExp.test(startTime))
      || (endTime && !dateRegExp.test(endTime))) {
    throw new Error('Please enter a date in the format "YYYY-MM-DD[T]HH:MM:SS[Z]" where [] wraps a fixed character value');
  }

  console.log('run2');

  // convert the start and end times into Date() objects
  const pollingStartTime = new Date(startTime);
  const pollingEndTime = new Date(endTime || 8640000000000000); // the latest time possible
  const polledTimestamp = pollConfig === 'updatedTime' ? 'lastModified' : 'created';

  // retrieve a list of objects, ordered from earliest to latest
  const queryString = `${encodeURIComponent(objectType)}?_sort=${polledTimestamp}&_order=asc`;
  // due to API limitations, filtering of results to only be within
  // the start and end times must happen after the query.
  const resultsList = await client.makeRequest({
    url: queryString,
    method: 'GET',
  });

  // convert all the date values in resultsList to Date() objects,
  // then filter resultsList to only include objs modified/created within
  // pollingStartTime and pollingEndTime inclusive.
  resultsList.forEach((obj) => { obj[polledTimestamp] = new Date(obj[polledTimestamp]); });
  resultsList.filter((obj) => obj[polledTimestamp] >= pollingStartTime
      && obj[polledTimestamp] <= pollingEndTime)
    .forEach(async (result) => {
      // now that we have our list, emit all the values,
      // converting Date objects back to ISO8601 format
      result[polledTimestamp] = result[polledTimestamp].toISOString();
      await this.emit('data', messages.newMessageWithBody(result));
    });
};

/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's output data depending on the selected object type.
 * See upsert.js for a detailed example of retrieving dynamic metadata
 * and an explanation of what dynamic metadata is.
 */

exports.getMetaModel = async function getMetaModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);

  const description = await exampleServiceLogicClient.getObjectAttributes(cfg.objectType);

  const outputMetadata = {
    type: 'object',
    properties: {
      ...description,
      created: {
        title: 'Created Time',
        type: 'string',
      },
      lastModified: {
        title: 'Time Last Modified',
        type: 'string',
      },
    },
  };

  return {
    out: outputMetadata,
  };
};

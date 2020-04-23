/* eslint-disable no-console */
const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const ExampleServiceLogicClient = require('../exampleServiceLogicClient');

/**
 * this action uses the Upsert Product by Unique Criteria design pattern in the OIH standard:
 * https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#upsert-object
 * @param msg includes the values for each field of the input metadata
 * @param cfg is the values for the configuration fields of the action
 */

exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    upsertCriteria,
  } = cfg;
  const { body } = msg;

  // We need to learn if the object exists, in order to determine if we should
  // do a POST or a PATCH request. If the object exists, we also need to
  // know the ID in order to complete the PATCH request.

  // Building the query to check if the object exists. See the example-service API:
  // https://github.com/elasticio/example-service
  const upsertCriteriaValue = msg.body[upsertCriteria];
  // Remember to encode values that are written into URLs
  const queryString = `${encodeURIComponent(objectType)}?${encodeURIComponent(upsertCriteria)}=${encodeURIComponent(upsertCriteriaValue)}`;

  const searchResult = await client.makeRequest({
    url: queryString,
    method: 'GET',
  });

  // we only want one object to be upserted.
  if (searchResult.length > 1) {
    throw new Error('More than one matching object found.');
  }

  // if the requested object doesn't exist, create a new object (Insert)
  if (searchResult.length === 0) {
    const createdObject = await client.makeRequest({
      url: `${encodeURIComponent(objectType)}`,
      method: 'POST',
      body,
    });
    await this.emit('data', messages.newMessageWithBody({
      createdObject,
    }));
    return;
  }

  // otherwise update the existing object (Update)

  // retrieving the ID to complete the update request.
  const objectToUpdateId = searchResult[0].id;
  // removing the ID field from the message body
  const { id, ...bodyExcludingId } = msg.body;
  // we use the PATCH request because we only want to make partial updates.
  const updatedObject = await client.makeRequest({
    url: `${encodeURIComponent(objectType)}/${encodeURIComponent(objectToUpdateId)}`,
    method: 'PATCH',
    body: bodyExcludingId,
  });
  await this.emit('data', messages.newMessageWithBody({
    updatedObject,
  }));
};

/* eslint-disable no-param-reassign */
const { messages } = require('elasticio-node');
const DataServicesClient = require('../dataServicesClient');

exports.process = async function process(msg, cfg, snapshot) {
  const {
    accountid, eventId, lastModifiedGt, lastModifiedLt, singlePagePerInterval,
  } = cfg;
  const dateRegExp = new RegExp('([12]\\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])) ([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)');
  if ((lastModifiedLt && !dateRegExp.test(lastModifiedLt))
      || (lastModifiedGt && !dateRegExp.test(lastModifiedGt))) {
    throw new Error('Please enter a date in the format "YYYY-MM-DD HH:MM:SS"');
  }
  const lastModifiedDate = new Date(lastModifiedLt || 8640000000000000);
  const fromSnapshot = (Boolean(snapshot) && Object.keys(snapshot).length !== 0);
  const pageSize = Number(cfg.pageSize);
  if (pageSize && (pageSize < 0 || !Number.isInteger(pageSize))) {
    throw new Error('Please enter a positive integer for page size');
  }
  if (fromSnapshot) {
    this.logger.info(`Fetching another page from snapshot starting from time ${snapshot.lastUpdated}`);
  }
  snapshot = snapshot || {};
  const client = new DataServicesClient(this, cfg);

  if (singlePagePerInterval) {
    const resultsList = (await client.makeRequest({
      url: `attendeelist/${accountid}/${eventId}`,
      method: 'GET',
      qs: {
        accountid,
        ...((snapshot.lastUpdated || lastModifiedGt) && { 'lastmodified-gt': snapshot.lastUpdated || lastModifiedGt }),
        ...(lastModifiedLt && { 'lastmodified-lt': lastModifiedLt }),
        ...(pageSize && { pageSize }),
      },
    }))
      .ResultSet
      .filter((attendee) => new Date(attendee.lastmodified) <= lastModifiedDate);

    // Shift the first element (which was the last element of the previous query)
    if (fromSnapshot) resultsList.shift();
    this.logger.info(`Found ${resultsList.length} new record${resultsList.length === 1 ? '' : 's'}`);
    if (resultsList.length > 0) {
      if (resultsList.length > 1
        && resultsList[0].lastmodified === resultsList[resultsList.length - 1].lastmodified) {
        throw new Error(`All objects on this page have the same last modified time ${resultsList[0].lastmodified}. Please raise your page size.`);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const result of resultsList) {
        // eslint-disable-next-line no-await-in-loop
        await this.emit('data', messages.newMessageWithBody(result));
      }

      snapshot.lastUpdated = resultsList[resultsList.length - 1].lastmodified;
      this.logger.info(`New snapshot: ${snapshot.lastUpdated}`);
      await this.emit('snapshot', snapshot);
    }
  } else {
    let resultsList;
    let currPage = 1;
    let emitCount = 0;
    do {
      // eslint-disable-next-line no-await-in-loop
      resultsList = (await client.makeRequest({
        url: `attendeelist/${accountid}/${eventId}`,
        method: 'GET',
        qs: {
          accountid,
          pageNumber: currPage,
          ...(lastModifiedGt && { 'lastmodified-gt': lastModifiedGt }),
          ...(lastModifiedLt && { 'lastmodified-lt': lastModifiedLt }),
          ...(pageSize && { pageSize }),
        },
      }))
        .ResultSet
        .filter((attendee) => new Date(attendee.lastmodified) <= lastModifiedDate);

      if (!resultsList.length) {
        this.logger.info('No more results found');
      } else {
        this.logger.info(`Found ${resultsList.length} new record${resultsList.length === 1 ? '' : 's'}`);
      }
      currPage += 1;
      emitCount += resultsList.length;
      // eslint-disable-next-line no-restricted-syntax
      for (const result of resultsList) {
        // eslint-disable-next-line no-await-in-loop
        await this.emit('data', messages.newMessageWithBody(result));
      }
    } while (resultsList.length > 0);
    this.logger.info(`Emitted ${emitCount} record${emitCount === 1 ? '' : 's'}`);
  }
};

exports.eventId = async function eventId(cfg) {
  const self = {};
  self.logger = { trace: () => { } };
  const client = new DataServicesClient(self, cfg);
  return client.getEvents();
};

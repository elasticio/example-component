const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const MetaLoader = require('../metaLoader');

// this action uses the Lookup Object (at most 1) by Unique Criteria design pattern in the OIH standard:
// https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#lookup-object-at-most-1
exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    lookupCriteria,
    allowIdToBeOmitted,
    allowZeroResults,
    allowCriteriaToBeOmitted,
    waitForObjectToExist,
    linkedObjectsToPopulate = [],
  } = cfg;

  // According to the OIH specification, the first step is to check if the id has been defined.
  if (!id) {
    if (allowCriteriaToBeOmitted) {
      await this.emit(messages.newEmptyMessage);
    } else {
      throw new Error('No object ID has been provided');
    }
  }

  // handle retrieving the new object, optionally with linked objects

  let queryResult;

  // Building the query. See the example-service API: https://github.com/elasticio/example-service
  let encodedId = msg.body[lookupCriteria];
  if (lookupCriteria === 'id') {
    encodedId = encodeURI(encodedId);
  }

  // INCLUDE RELATIONSHIPS IN QUERY

  const queryString = `${objectType}?${lookupCriteria}=${encodedId}`;

  // Retrieve the object by the given unique field.
  try {
    queryResult = await client.makeRequest({
      url: queryString,
      method: 'GET',
    });
  } catch (err) {
    this.emit('Error', err);
  }

  // FINISH
};


/**
 * Define schema for Lookup Criteria dropdown menu.
 */

exports.getUniqueFieldsModel = function getUniqueFieldsModel(cfg) {
  this.logger = { trace: () => {} };
  const metaLoader = new MetaLoader(this, cfg);
  return metaLoader.getUniqueFieldsModel();
};

/**
 * Using the function defined in metaLoader.js.
 * See that file for more information.
 */
exports.getLinkedObjectsModel = async function getLinkedObjectsModel(cfg) {
  this.logger = { trace: () => {} };
  const metaLoader = new MetaLoader(this, cfg);
  return metaLoader.getLinkedObjectsModel();
};

/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's input data depending on the selected object type.
 * See upsert.js for a detailed example of retrieving dynamic metadata.
 */
exports.getMetaModel = async function getMetaModel(cfg) {
  this.logger = { trace: () => {} };
  const client = new MetaLoader(this, cfg);

  const description = await client.getObjectAttributes();

  const inputMetadata = {
    type: 'object',
    properties: {
      // isolate the unique field
      ...description[cfg.lookupCriteria],
    },
  };

  return {
    in: inputMetadata,
  };
};

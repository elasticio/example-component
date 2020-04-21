const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const ExampleServiceLogicClient = require('../exampleServiceLogicClient');

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

  // First, check if the unique lookup criteria has been defined.
  if (!lookupCriteria) {
    if (allowCriteriaToBeOmitted) {
      await this.emit(messages.newEmptyMessage);
    } else {
      throw new Error('No unique criteria has been provided');
    }
  }

  // handle retrieving the new object, optionally with linked objects

  // Building the query. See the example-service API: https://github.com/elasticio/example-service
  let encodedId = msg.body[lookupCriteria];
  if (lookupCriteria === 'id') {
    encodedId = encodeURI(encodedId);
  }

  // INCLUDE RELATIONSHIPS IN QUERY

  const queryString = `${objectType}?${lookupCriteria}=${encodedId}`;

  // Retrieve the object using the given unique field.
  const queryResult = await client.makeRequest({
    url: queryString,
    method: 'GET',
  });

  // FINISH
};


/**
 * Define schema for Lookup Criteria dropdown menu.
 */

exports.getUniqueFieldsModel = function getUniqueFieldsModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);
  return exampleServiceLogicClient.getUniqueFieldsModel(cfg.objectType);
};

/**
 * Using the function defined in exampleServiceLogicClient.js.
 * See that file for more information.
 */
exports.getLinkedObjectsModel = async function getLinkedObjectsModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);
  return exampleServiceLogicClient.getLinkedObjectsModel(cfg.objectType);
};

/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's input data depending on the selected object type.
 * See upsert.js for a detailed example of retrieving dynamic metadata.
 */
exports.getMetaModel = async function getMetaModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);

  const description = await exampleServiceLogicClient.getObjectAttributes(cfg.objectType);

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

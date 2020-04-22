const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const ExampleServiceLogicClient = require('../exampleServiceLogicClient');

/**
 * This action uses the Delete Object by Unique Criteria OIH design pattern:
 * https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#lookup-object-at-most-1
 */

exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    deleteCriteria,
  } = cfg;

  const deleteCriteriaValue = msg.body[deleteCriteria];

  // First, we'll search for the object by sending a GET request.
  // Building the query to retrieve the object. See the example-service API:
  // https://github.com/elasticio/example-service
  let queryString = `${encodeURIComponent(objectType)}?${encodeURIComponent(deleteCriteria)}=${encodeURIComponent(deleteCriteriaValue)}`;

  // Fetch the object(s) with the associated unique criteria.
  const foundObjects = await client.makeRequest({
    url: queryString,
    method: 'GET',
  });

  // The query retrieved more than 1 object, which is out of the scope of this action.
  if (foundObjects.length > 1) {
    throw new Error('More than one object found');
  }

  // If there is no object found with the specified criteria, emit the empty object.
  if (foundObjects.length === 0) {
    await this.emit('data', messages.newEmptyMessage());
    return;
  }

  // The only remaining case is if exactly one object was found.
  // We simply need to retrieve the ID of the relevant object and delete it.

  // Get the corresponding ID of the foundObject.
  const objectToDeleteId = foundObjects[0].id;

  // Build the query string with the object id.
  queryString = `${encodeURIComponent(objectType)}/${encodeURIComponent(objectToDeleteId)}`;

  // Delete the specified object
  await client.makeRequest({
    url: queryString,
    method: 'DELETE',
  });

  // Just emit the id of the deleted object
  await this.emit('data', messages.newMessageWithBody({
    id: objectToDeleteId,
  }));
};


/**
 * Define schema for Delete Criteria dropdown menu.
 */

exports.getUniqueFieldsModel = function getUniqueFieldsModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);
  return exampleServiceLogicClient.getUniqueFieldsModel(cfg.objectType);
};

/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's input data depending on the selected object type.
 * See upsert.js for a detailed example of retrieving dynamic metadata
 * and an explanation of what dynamic metadata is.
 */

exports.getMetaModel = async function getMetaModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);

  const description = await exampleServiceLogicClient.getObjectAttributes(cfg.objectType);

  const inputMetadata = {
    type: 'object',
    properties: {
      [cfg.deleteCriteria]: description[cfg.deleteCriteria],
    },
  };

  return {
    in: inputMetadata,
  };
};

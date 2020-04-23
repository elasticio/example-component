const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const ExampleServiceLogicClient = require('../exampleServiceLogicClient');

/**
 * This action uses the Lookup Object (at most 1) by Unique Criteria OIH design pattern:
 * https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#lookup-object-at-most-1
 */

exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    lookupCriteria,
    allowCriteriaToBeOmitted,
    allowZeroResults,
    waitForObjectToExist,
    linkedObjectToPopulate,
  } = cfg;

  const lookupCriteriaValue = msg.body[lookupCriteria];

  // First, check if the unique lookup criteria has been defined.
  if (!lookupCriteriaValue) {
    if (allowCriteriaToBeOmitted) {
      await this.emit('data', messages.newEmptyMessage());
      return;
    }
    throw new Error('No entry for unique criteria has been provided');
  }

  // Building the query to retrieve the object, optionally including linked objects.
  // See the example-service API: https://github.com/elasticio/example-service
  let queryString = `${encodeURIComponent(objectType)}?${encodeURIComponent(lookupCriteria)}=${encodeURIComponent(lookupCriteriaValue)}`;

  // Fetch the object(s) with the associated unique criteria.
  // Excluding linked objects for the time being (due to API limitations).
  const foundObjects = await client.makeRequest({
    url: queryString,
    method: 'GET',
  });

  // The query retrieved more than 1 object, which is out of the scope of this action.
  if (foundObjects.length > 1) {
    throw new Error('More than one object found');
  }

  // The case where the object is not (initially) found
  if (foundObjects.length === 0) {
    if (waitForObjectToExist) {
      await this.emit('rebound', 'Object not found');
    }
    if (allowZeroResults) {
      await this.emit('data', messages.newEmptyMessage());
      return;
    }
    throw new Error('Object not found');
  }

  // The only remaining case is if exactly one object was found.
  // Need to check whether a linked object were queried, and if so, make another call
  // to the API to include the linked object in the result. Otherwise, just return the foundObject.

  let foundObject;

  // Add linked object to the query if they are included.
  // Note: the Example Service API does not allow for more than 1 linked object to be included
  // in the query. However, it is possible to include additional linked objects if your API allows.
  // To do this, change the viewClass parameter for linkedObjectsToPopulate in component.json
  // to a MultiSelectView, and adjust the query string assembly accordingly to account for multiple
  // queried child and/or parent linked objects.
  if (linkedObjectToPopulate) {
    // In the Example Service API, children objects are referred to in plural
    // while parent objects are referred to in the singular.
    // Since no object type's singular form ends in an 's', we can check the
    // object relationship type by testing whether the object name ends in an 's'.
    // Test for children:
    const linkedObjectParam = linkedObjectToPopulate.endsWith('s')
      ? `_embed=${encodeURIComponent(linkedObjectToPopulate)}`
      : `_expand=${encodeURIComponent(linkedObjectToPopulate)}`;

    // Get the corresponding ID of the foundObject.
    const objectToQueryId = foundObjects[0].id;

    // build the query string with the linked object.
    queryString = `${encodeURIComponent(objectType)}/${encodeURIComponent(objectToQueryId)}?${linkedObjectParam}`;

    // retrieve the requested object with its linked child/parent.
    foundObject = await client.makeRequest({
      url: queryString,
      method: 'GET',
    });
  } else {
    // If there was no linked object included, just output the foundObjects value.
    [foundObject] = foundObjects;
  }

  await this.emit('data', messages.newMessageWithBody({
    foundObject,
  }));
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
 * See upsert.js for a detailed example of retrieving dynamic metadata
 * and an explanation of what dynamic metadata is.
 */

exports.getMetaModel = async function getMetaModel(cfg) {
  const exampleServiceLogicClient = new ExampleServiceLogicClient(this, cfg);

  const description = await exampleServiceLogicClient.getObjectAttributes(cfg.objectType);

  // the lookup criteria may be required if cfg.allowCriteriaToBeOmitted is false, and vice versa.
  description[cfg.lookupCriteria].required = !cfg.allowCriteriaToBeOmitted;

  const inputMetadata = {
    type: 'object',
    properties: {
      [cfg.lookupCriteria]: description[cfg.lookupCriteria],
    },
  };

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
    in: inputMetadata,
    out: outputMetadata,
  };
};

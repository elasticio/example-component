/* eslint-disable no-console */
const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');
const MetaLoader = require('../metaLoader');

// this action uses the Upsert Product by Unique Criteria design pattern in the OIH standard:
// https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#upsert-object
exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  const {
    objectType,
    upsertCriteria,
  } = cfg;
  // msg includes the values for each field of the input metadata
  const { body } = msg;

  // We need to learn if the object exists, in order to determine if we should
  // do a POST or a PATCH request. If the object exists, we also need to
  // know the ID in order to complete the PATCH request.

  let searchResult;
  // Building the query to check if the object exists. See the example-service API:
  // https://github.com/elasticio/example-service
  const upsertCriteriaValue = msg.body[upsertCriteria];
  // the URL encoding. It may not be necessary to encode objectType and upsertCriteria
  // if your system disallows non-url safe characters for fields and object types.
  const queryString = `${encodeURIComponent(objectType)}?${encodeURIComponent(upsertCriteria)}=${encodeURIComponent(upsertCriteriaValue)}`;

  try {
    searchResult = await client.makeRequest({
      url: queryString,
      method: 'GET',
    });
  } catch (err) {
    this.emit('Error', err);
  }

  // we only want one object to be upserted.
  if (searchResult.length > 1) {
    throw new Error('More than one matching object found.');
  }

  // if the requested object doesn't exist, create a new object (Insert)
  if (searchResult.length === 0) {
    const createdObject = await client.makeRequest({
      url: `${objectType}`,
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
    url: `${objectType}/${objectToUpdateId}`,
    method: 'PATCH',
    body: bodyExcludingId,
  });
  await this.emit('data', messages.newMessageWithBody({
    updatedObject,
  }));
};


/**
 * The model for the second configuration parameter.
 * This retrieves a list of all of the fields of the object that uniquely identify
 * it and can be used as query parameters in addition to the ID.
 * Uses the predefined function in the MetaLoader class.
 */

exports.getUniqueFieldsModel = function getUniqueFieldsModel(cfg) {
  const client = new ExampleClient(this, cfg);
  const metaLoader = new MetaLoader(this, cfg, client);
  return metaLoader.getUniqueFieldsModel(cfg.objectType);
};

/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's input data depending on the selected object type.
 * Dynamic metadata is object metadata that will be sent with the request,
 * but is not defined in a schema (i.e. a .in.json file). Instead, it's generated
 * at runtime depending on the selection in the configuration fields.
 * In this case, we use it because different objectTypes (which are selected
 * in configuration) have different metadata fields that must be upserted.
 */
exports.getMetaModel = async function getMetaModel(cfg) {
  const client = new ExampleClient(this, cfg);
  const metaLoader = new MetaLoader(this, cfg, client);

  // retrieve the component metadata based on the selected objectType
  // using the helper function defined in the MetaLoader class
  const description = await metaLoader.getObjectAttributes(cfg.objectType);

  // Component metadata is defined using the JSONSchema standard: https://json-schema.org/
  // with an additional 'title' property used by the platform for displaying the fields.
  // Since the API returns this format, we simply need to add it to the inputMetadata object.

  // Note that according to the OIH Specification:
  // "The fields that are part of the upsert criteria are marked as being part of the criteria.
  // If the criteria is something other than the ID, they should be marked as required."
  description[cfg.upsertCriteria].title += ' (Upsert Criteria)';
  console.log(cfg.upsertCriteria);
  if (cfg.upsertCriteria !== 'id') {
    console.log('run');
    description[cfg.upsertCriteria].required = true;
  }

  // In addition, the specification states:
  // "All fields that are not nullable and can’t be populated
  // by the system on create should be required."
  // Even though not all of the required fields may be needed
  // if a PATCH request is made, these fields will be required
  // in the case of a POST request.

  // In the object description retrieved from the API, those criteria have already been specified.
  // However, it may be necessary to include a check to ensure that this is the case with data
  // from another API.
  const inputMetadata = {
    type: 'object',
    properties: description,
  };

  // the object returned by the response also includes two timestamp fields
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

  // the model of the data that should be input into the action.
  // You can optionally include an 'out:' attribute to define the
  // shape of the data output by the action.
  return {
    in: inputMetadata,
    out: outputMetadata,
  };
};

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

  // According to the OIH Specification, the first step is to check if the object exists.
  let searchResult;
  // building the query. See the example-service API: https://github.com/elasticio/example-service
  // msg includes the values for each field of the input metadata
  // remember to encode any ID fields!
  let encodedId = msg.body[upsertCriteria];
  if (upsertCriteria === 'id') {
    encodedId = encodeURI(encodedId);
  }
  const queryString = encodeURI(`${objectType}?${upsertCriteria}=${encodedId}`);

  try {
    searchResult = await client.makeRequest({
      url: queryString,
      method: 'GET',
    });
  } catch (err) {
    this.emit('Error', err);
  }

  // if the requested object doesn't exist, create a new object (Insert)
  if (searchResult.length === 0) {
    const createdObject = await client.makeRequest({
      url: `${objectType}`,
      method: 'POST',
      body: msg.body,
    });
    await this.emit('data', messages.newMessageWithBody({
      createdObject,
    }));
  // otherwise update the existing object (Update)
  } else if (searchResult.length === 1) {
    const objectToUpdateId = searchResult[0].id;
    const updatedObject = await client.makeRequest({
      url: `${objectType}/${objectToUpdateId}`,
      method: 'PATCH',
      body: msg.body,
    });
    await this.emit('data', messages.newMessageWithBody({
      updatedObject,
    }));
  } else {
    throw new Error('More than one matching object found.');
  }
};


/**
 * The model for the second configuration parameter.
 * Uses the predefined function in the MetaLoader class.
 */

exports.getUniqueFieldsModel = function getUniqueFieldsModel(cfg) {
  this.logger = { trace: () => {} };
  const metaLoader = new MetaLoader(this, cfg);
  return metaLoader.getUniqueFieldsModel();
};

/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's input data depending on the selected object type.
 */
exports.getMetaModel = async function getMetaModel(cfg) {
  this.logger = { trace: () => {} };
  const client = new MetaLoader(this, cfg);

  // retrieve the component metadata based on the selected objectType
  // using the helper function defined in the MetaLoader class
  const description = await client.getObjectAttributes();

  // Component metadata is defined using the JSONSchema standard: https://json-schema.org/
  // with an additional 'title' property used by the platform for displaying the fields.
  // Since the API returns this format, we simply need to add it to the inputMetadata object.

  // Note that according to the OIH Specification:
  // "The fields that are part of the upsert criteria are marked as being part of the criteria.
  // If the criteria is something other than the ID, they should be marked as required."
  description[cfg.upsertCriteria].title += ' (Upsert Criteria)';
  description[cfg.upsertCriteria].required = true;

  // In addition, the specification states:
  // "All fields that are not nullable and can’t be populated by the system on create should be required."
  // In the object description, those criteria have already been specified. However, it may be necessary
  // to include a check to ensure that this is the case with data from another API.
  const inputMetadata = {
    type: 'object',
    properties: {
      ...description,
    },
  };

  // the model of the data that should be input into the action.
  // can optionally include an 'out:' attribute to define the
  // shape of the data output by the action, however it is not necessary
  return {
    in: inputMetadata,
  };
};

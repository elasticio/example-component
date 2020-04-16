const { messages } = require('elasticio-node');
const ExampleClient = require('../exampleClient');

// this action uses the Upsert Product by ID design pattern in the OIH standard:
// https://github.com/elasticio/Connectors/blob/master/Adapters/AdapterBehaviorStandardization/StandardizedActionsAndTriggers.md#upsert-object
exports.process = async function process(msg, cfg) {
  const client = new ExampleClient(this, cfg);
  // msg includes the values for each field of the input metadata
  const { id } = msg.body;

  try {
    // According to the OIH Specification, the first step is to check if the object exists.
    const searchResult = await client.makeRequest({
      url: `${cfg.objectType}s/${id}`,
      method: 'GET',
      // We modify the default response handler to distinguish between 404 errors
      // and other errors to allow us to search the database.
      responseHandler: (response, handleRestResponse) => {
        const { statusCode } = response;
        if (statusCode < 400 || statusCode === 401) {
          return statusCode;
        }
        return handleRestResponse(response);
      },
    });

    // if the requested object doesn't exist, create a new object (Insert)
    if (searchResult === 401) {
      const createdObject = await client.makeRequest({
        url: `${cfg.objectType}s`,
        method: 'POST',
        body: msg.body,
      });
      await this.emit('data', messages.newMessageWithBody({
        createdObject,
      }));
    // otherwise update the existing object (Update)
    } else {
      const updatedObject = await client.makeRequest({
        url: `${cfg.objectType}s/${id}`,
        method: 'PUT',
        body: msg.body,
      });
      await this.emit('data', messages.newMessageWithBody({
        updatedObject,
      }));
    }
  } catch (err) {
    console.log("run2");
    this.emit('Error', err);
  }
};

/**
 * Helper functions for getMetaModel()
 */

/**
 * Returns the description of the object type from the API
 */
async function getObjectAttributes(client, objectType) {
  const description = await client.makeRequest({
    url: `${objectType}/attributes`,
    method: 'GET',
  });
  return description;
}


/**
 * Since this action uses dynamic metadata (see component.json),
 * we must define the function getMetaModel, which will define the shape
 * for the action's input data depending on the selected object type.
 */
exports.getMetaModel = async function getMetaModel(cfg) {
  this.logger = { trace: () => {} };
  const client = new ExampleClient(this, cfg);

  // retrieve the component metadata based on the selected objectType
  const description = await getObjectAttributes(client, cfg.objectType);

  // Component metadata is defined using the JSONSchema standard: https://json-schema.org/
  // with an additional 'title' property used by the platform for displaying the fields.
  // Since the API returns this format, we simply need to add it to the inputMetadata object.

  // Note that according to the OIH Specification:
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

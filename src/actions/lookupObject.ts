import Client from '../client';

const { messages } = require('elasticio-node');

// eslint-disable-next-line max-len
exports.process = async function ProcessAction(msg: any, cfg: any) {
  this.logger.info('"Lookup Object (at most 1)" action started');
  const client = new Client(this, cfg);
  const { objectType, lookupCriteria } = cfg;
  const { lookupCriteriaValue } = msg.body;
  if (!lookupCriteriaValue) {
    if (cfg.allowIdToBeOmitted) {
      return messages.newMessageWithBody({});
    }
    throw new Error('No "Lookup Criteria Value" provided!');
  }

  const path = `${cfg.baseUrl}/${objectType}/${lookupCriteria}`;
  const { result, error }: any = await client.apiRequest({
    method: 'GET',
    url: path,
  });

  if (result?.data) {
    if (result.data.length === 0) {
      if (cfg.allowZeroResults) {
        return messages.newMessageWithBody({});
      }
      if (error) throw new Error(error);
      throw new Error('No object found!');
    } if (result.data.length > 1) {
      throw new Error('More than 1 object found!');
    }
    // eslint-disable-next-line prefer-destructuring
    result.data = result.data[0];
  }

  if (result) {
    return messages.newMessageWithBody({ result });
  } if (cfg.allowZeroResults) {
    return messages.newMessageWithBody({});
  } if (error) {
    throw new Error(error);
  }
  throw new Error('Unexpected error');
};

exports.getMetaModel = async function getMetaModel(cfg: { allowIdToBeOmitted: any; }) {
  const meta = {
    in: {
      type: 'object',
      properties: {
        lookupCriteriaValue: {
          type: 'string',
          required: true,
          title: 'Lookup Criteria Value',
        },
      },
    },
    out: {
      type: 'object',
      properties: {
        result: {
          type: 'object',
          properties: {},
        },
      },
    },
  };

  if (cfg.allowIdToBeOmitted) {
    meta.in.properties.lookupCriteriaValue.required = false;
  }

  return meta;
};

exports.getLookupCriteria = async function (cfg: { objectType: string; }) {
  const result: any = {};
  switch (cfg.objectType) {
    case 'customer':
      result.id = 'ID';
      result.email = 'Email';
      break;
    case 'product':
      result.id = 'ID';
      result.sku = 'SKU';
      break;
    default:
      result.id = 'ID';
  }
  return result;
};

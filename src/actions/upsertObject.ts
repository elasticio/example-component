import { messages } from 'elasticio-node';
import Client from '../client';
import usersSchema from '../schemas/actions/users.json';
import productSchema from '../schemas/actions/products.json';

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Upsert Object" action started');
  const { id } = msg.body;
  const { objectType } = cfg;
  const reqData = JSON.parse(JSON.stringify(msg.body));
  delete reqData.id;

  const client = new Client(this, cfg);
  if (id) {
    try {
      const { data } = await client.apiRequest({
        url: `/${objectType}/${id}`,
        method: 'PUT',
        data: reqData
      });
      this.logger.info('"Upsert Object" action is done emitting...');
      return messages.newMessageWithBody(data);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Object with id "${id}" is not found!`);
      }
      throw error;
    }
  }
  this.logger.info('object not found, going to create...');
  const { data } = await client.apiRequest({
    url: `/${objectType}`,
    method: 'POST',
    data: reqData
  });
  this.logger.info('"Upsert Object" action is done emitting...');
  return messages.newMessageWithBody(data);
}

export const getMetaModel = async function (cfg: { objectType: string }) {
  const schemas = {
    users: usersSchema,
    products: productSchema
  };
  const metadata = {
    in: {
      type: 'object',
      properties: {
        ...schemas[cfg.objectType].in,
        id: {
          type: 'string',
          title: 'ID'
        }
      }
    },
    out: {
      type: 'object',
      properties: {
        ...schemas[cfg.objectType].out,
        id: {
          type: 'string',
          required: true
        }
      }
    }
  };
  return metadata;
};

module.exports.process = processAction;
module.exports.getMetaModel = getMetaModel;

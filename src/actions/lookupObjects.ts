/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import { messages } from 'elasticio-node';
import Client from '../client';

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Lookup Objects" action started');
  const client = new Client(this, cfg);
  const { objectType, emitBehavior } = cfg;
  const { searchCriteria } = msg.body;

  const url = `/${objectType}?${searchCriteria.join('&')}`;
  const { data: results } = await client.apiRequest({
    method: 'GET',
    url,
  });

  switch (emitBehavior) {
    case 'emitAll': {
      return messages.newMessageWithBody({ results });
    }
    case 'emitPage': {
      return emitAsPages.call(this, results, msg.body);
    }
    case 'emitIndividually': {
      for (const item of results) {
        await this.emit('data', messages.newMessageWithBody(item));
      }
      break;
    }
    default: throw new Error(`Emit Behavior "${emitBehavior}" is not supported!`);
  }
}

export const getMetaModel = async function getMetaModel(cfg) {
  let additionalIn = {};
  if (cfg.emitBehavior === 'emitPage') {
    additionalIn = {
      pageSize: {
        title: 'Page Size [0-50]',
        help: {
          description: `Specifies the number of objects per page. 
          A value of 0 indicates that the results will be an empty array with only total count of matching results`,
        },
        type: 'number',
        required: false,
      },
      pageNumber: {
        title: 'Page Number [1-50]',
        help: {
          description: 'Specifies the limit number of pages to fetch.',
        },
        type: 'number',
        required: false,
      },
    };
  }
  return {
    in: {
      type: 'object',
      properties: {
        ...additionalIn,
        searchCriteria: {
          title: 'Search Criteria',
          help: {
            description: 'Search terms as array of strings. Search terms are to be combined with the AND operator. Example: ["userAge>29", "userName=Alex"]',
          },
          type: 'array',
          required: false,
          items: {
            type: 'string',
          },
        },
      },
    },
    out: {
      type: 'object',
      properties: {},
    },
  };
};

const emitAsPages = async function (results, { pageSize = 5, pageNumber = 2 }) {
  if (pageSize === 0) {
    return messages.newMessageWithBody({ totalCountOfMatchingResults: results.length });
  }
  const pages = [];
  for (let i = 0; i < results.length; i += pageSize) {
    const page = results.slice(i, i + pageSize);
    pages.push(page);
  }
  if (pages.length > pageNumber) pages.length = pageNumber;
  for (const item of pages) {
    await this.emit('data', messages.newMessageWithBody(item));
  }
};

module.exports.getMetaModel = getMetaModel;
module.exports.process = processAction;

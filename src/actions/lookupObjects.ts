/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
import { messages } from 'elasticio-node';
import Client from '../client';

const TERM_MAX_NUMBER = 99;

function isNumberInInterval(num, min, max) {
  return !(Number.isNaN(num) || num < min || num > max);
}

function getTermNumber(cfg) {
  const termNumber = cfg.termNumber ? parseInt(cfg.termNumber, 10) : 0;
  if (!isNumberInInterval(termNumber, 0, TERM_MAX_NUMBER)) {
    throw new Error('Number of search terms must be an integer value from the interval [0-99]');
  }
  return termNumber;
}

function getSearchCriteria(msg, cfg) {
  const termNumber = getTermNumber(cfg);
  if (termNumber === 0) {
    return null;
  }
  let searchCriteria = '';
  for (let i = 1; i <= termNumber; i += 1) {
    const { fieldName, condition, fieldValue } = msg.body[`sTerm_${i}`];
    searchCriteria += `${fieldName} ${condition} ${fieldValue}`;
    if (i !== termNumber) {
      searchCriteria += ` ${msg.body[`link_${i}_${i + 1}`]} `;
    }
  }
  return searchCriteria;
}

export async function processAction(msg: any, cfg: any) {
  this.logger.info('"Lookup Objects" action started');
  const client = new Client(this, cfg);
  const { objectType, emitBehavior } = cfg;
  const searchCriteria = getSearchCriteria(msg, cfg);
  let url = `/${objectType}`;
  if (searchCriteria) {
    url += `?${searchCriteria}`;
  }
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
        title: 'Page Number [>=0]',
        help: {
          description: 'Specifies the limit number of pages to fetch.',
        },
        type: 'number',
        required: false,
      },
    };
  }
  const termProperties = {};
  const termNumber = getTermNumber(cfg);
  if (termNumber > 0) {
    const fieldNameEnum = [];
    const conditionEnum = ['gt', 'lt', 'eq', 'ge', 'le', 'ne'];
    const logicalOperatorEnum = ['and', 'or'];
    for (let i = 1; i <= termNumber; i += 1) {
      termProperties[`sTerm_${i}`] = {
        title: `Search term ${i}`,
        type: 'object',
        required: true,
        properties: {
          fieldName: {
            title: 'Field name',
            type: 'string',
            required: true,
            enum: fieldNameEnum,
          },
          condition: {
            title: 'Condition',
            type: 'string',
            required: true,
            enum: conditionEnum,
          },
          fieldValue: {
            title: 'Field value',
            type: 'string',
            required: true,
          },
        },
      };

      if (i !== termNumber) {
        termProperties[`link_${i}_${i + 1}`] = {
          title: 'Logical operator',
          type: 'string',
          required: true,
          enum: logicalOperatorEnum,
        };
      }
    }
  }
  return {
    in: {
      type: 'object',
      properties: {
        ...additionalIn,
        ...termProperties,
      },
    },
    out: {
      type: 'object',
      properties: {},
    },
  };
};

const emitAsPages = async function emitAsPages(results, { pageSize = 5, pageNumber = 2 }) {
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

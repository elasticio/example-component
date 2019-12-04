const _ = require('lodash');

const prompts = (actionOrTrigger) => [
  {
    type: 'input',
    name: 'title',
    message: `What is your ${actionOrTrigger}'s name?`,
  }, {
    type: 'input',
    name: 'id',
    message: 'What name do you want to use in the code?',
    default: (prev) => _.camelCase(prev.title),
  }, {
    type: 'input',
    name: 'description',
    message: 'Please provide a description for your action',
    default: '',
  }, {
    type: 'list',
    name: 'webhookOrPolling',
    message: 'Is the trigger webhook or polling?',
    choices: ['Webhook', 'Polling'],
    when: () => actionOrTrigger === 'trigger',
  }, {
    type: 'confirm',
    name: 'oih',
    message: `Would you like to build your ${actionOrTrigger} off the OIH standard library?`,
  }, {
    type: 'list',
    name: 'actionType',
    message: `Please select your ${actionOrTrigger} from the OIH options`,
    when: (prev) => prev.oih,
    choices: () => {
      if (actionOrTrigger === 'action') {
        return [{
          name: 'Lookup Object',
          value: 'lookupObject',
        }, {
          name: 'Lookup Objects (many)',
          value: 'lookupObjects',
        }, {
          name: 'Upsert Object',
          value: 'upsert',
        }, {
          name: 'Delete Object',
          value: 'delete',
        }, {
          name: 'Create Object',
          value: 'create',
        }];
      }
      return [{
        name: 'Get New and Updated Objects Polling',
        value: 'getNewAndUpdated',
      }, {
        name: 'Webhook trigger',
        value: 'webhook',
      }];
    },
  }, {
    type: 'list',
    name: 'metadata',
    message: `What kind of metadata would you like to use for you ${actionOrTrigger}?`,
    choices: ['Static', 'Dynamic', {
      name: 'No Metadata',
      value: 'none',
    }],
  },
];

module.exports = prompts;

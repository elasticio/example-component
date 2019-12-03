const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');

module.exports = [
  {
    type: 'input',
    name: 'componentTitle',
    message: 'Component Name:',
  }, {
    type: 'input',
    name: 'componentName',
    message: 'Component directory to create:',
    default: (prev) => `${_.kebabCase(prev.componentTitle)}-component`,
    validate: (input) => {
      if (fs.existsSync(input)) {
        return 'This directory already exists. Please select a different name';
      }
      return true;
    },
  }, {
    type: 'input',
    name: 'logo',
    message: 'Link to logo: (if none available, push enter to add later)',
    default: '',
    validate: async (url) => {
      if (!url.length) return true;
      try {
        await axios({
          url,
          responseType: 'stream',
        });
      } catch {
        return 'Image could not be found, please enter again';
      }
      return true;
    },
  }, {
    type: 'list',
    name: 'license',
    message: 'Code license:',
    choices: ['None right now / Other', 'Apache-2.0', 'MIT'],
  }, {
    type: 'input',
    name: 'licenseName',
    message: 'Copyright owner name:',
    default: 'elastic.io GmbH <info@elastic.io>',
    when: (prev) => prev.license !== 'None right now / Other',
  }, {
    type: 'checkbox',
    name: 'credentials',
    message: 'Add some credential fields right now:',
    choices: ['API Key', 'Username', 'Password', 'URL', 'OAuth2'],
  }, {
    type: 'list',
    name: 'authentication',
    message: 'Select which kind of authentication your API uses (or is closest to):',
    choices: [
      {
        name: 'Basic Auth (Username/Password)',
        value: 'basic',
      }, {
        name: 'API Key',
        value: 'api',
      }, {
        name: 'Cookies',
        value: 'cookies',
      }, {
        name: 'OAuth2',
        value: 'oauth2',
      }, {
        name: 'No Auth / Other',
        value: 'none',
      },
    ],
  }, {
    type: 'confirm',
    name: 'eslint',
    message: 'Set up eslint now?',
    default: true,
  }, {
    type: 'confirm',
    name: 'npmInstall',
    message: 'NPM install after scaffolding?',
    default: true,
  },
];

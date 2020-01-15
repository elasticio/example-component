const path = require('path');

module.exports = Object.freeze({
  TEMPLATE_PATH: path.resolve(__dirname, '.'),
  CREDENTIAL_MAP: new Map([
    [
      'API Key',
      {
        apiKey: {
          label: 'API Key',
          viewClass: 'PasswordFieldView',
          required: true,
        },
      },
    ],
    [
      'Username',
      {
        username: {
          label: 'Username',
          viewClass: 'TextFieldView',
          required: true,
        },
      },
    ],
    [
      'Password',
      {
        password: {
          label: 'Password',
          viewClass: 'PasswordFieldView',
          required: true,
        },
      },
    ],
    [
      'URL',
      {
        url: {
          label: 'URL',
          viewClass: 'TextFieldView',
          required: true,
        },
      },
    ],
    [
      'OAuth2',
      {
        oauth: {
          label: 'OAuth2 Token',
          viewClass: 'OAuthFieldView',
          required: true,
        }
      },
    ],
  ]),
  LICENSE_MAP: new Map([
    ['None right now/other', null],
    ['Apache-2.0', 'apache2.0'],
    ['MIT', 'mit'],
  ]),
});

/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const prompts = require('../../lib/component-wizard/prompts');

describe('Prompts for component cli', () => {
  it('asks for component name', () => {
    expect(prompts[0]).to.deep.equal({
      type: 'input',
      name: 'componentTitle',
      message: 'Component Name:',
    });
  });

  it('correctly validates and creates default directory', () => {
    const componentName = prompts[1].default({ componentTitle: 'test' });
    expect(componentName).to.equal('test-component');
    const validation = prompts[1].validate('spec');
    expect(validation).to.equal('This directory already exists. Please select a different name');
    const successfulFile = prompts[1].validate('notSpec');
    expect(successfulFile).to.be.true;
  });

  it('checks image links are valid', async () => {
    const noUrl = await prompts[2].validate('');
    expect(noUrl).to.be.true;
    const invalidUrl = await prompts[2].validate('notAnImage!');
    expect(invalidUrl).to.equal('Image could not be found, please enter again');
    const validUrl = await prompts[2].validate('https://app.elastic.io/img/logo.svg');
    expect(validUrl).to.be.true;
  });

  it('asks for component license', () => {
    expect(prompts[3]).to.deep.equal({
      type: 'list',
      name: 'license',
      message: 'Code license:',
      choices: ['None right now / Other', 'Apache-2.0', 'MIT'],
    });
  });

  it('asks for copyright owner name if a license has been selected', () => {
    const shouldAsk = prompts[4].when('MIT');
    expect(shouldAsk).to.be.true;
  });

  it('should not ask for copyright owner name if no license has been selected', () => {
    const shouldAsk = prompts[4].when({ license: 'None right now / Other' });
    expect(shouldAsk).to.be.false;
  });

  it('asks for credential fields', () => {
    expect(prompts[5]).to.deep.equal({
      type: 'checkbox',
      name: 'credentials',
      message: 'Add some credential fields right now:',
      choices: ['API Key', 'Username', 'Password', 'URL', 'OAuth2'],
    });
  });

  it('asks to add authentication fields', () => {
    expect(prompts[6]).to.deep.equal({
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
    });
  });

  it('asks to add eslinting', () => {
    expect(prompts[7]).to.deep.equal({
      type: 'confirm',
      name: 'eslint',
      message: 'Set up eslint now?',
      default: true,
    });
  });
});

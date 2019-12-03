/* eslint-disable no-unused-expressions */
const chai = require('chai');
chai.use(require('chai-as-promised'));
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { run } = require('../../lib/component-wizard/run');

const { expect } = chai;

describe('Tests for component CLI tool', () => {
  describe('Files creations', () => {
    const testPath = path.resolve('test-component');

    describe('Basic prompts with pre-existing folder', () => {
      const prompts = {
        componentTitle: 'test',
        componentName: 'test-component',
        logo: '',
        license: 'None right now / Other',
        credentials: [],
        authentication: 'none',
        eslint: false,
        npmInstall: false,
      };

      before(() => fs.mkdirSync(prompts.componentName));
      after(() => rimraf.sync(path.resolve(prompts.componentName)));

      it(
        'throws when trying to create a component folder that already exists',
        async () => { await expect(run(prompts)).to.eventually.be.rejectedWith('folder already exists'); },
      );
    });

    describe('Basic prompts', () => {
      const prompts = {
        componentTitle: 'test',
        componentName: 'test-component',
        logo: '',
        license: 'None right now / Other',
        credentials: [],
        authentication: 'none',
        eslint: false,
        npmInstall: false,
      };

      before(async () => { await run(prompts); });
      after(() => rimraf.sync(path.resolve(prompts.componentName)));

      it('creates a component folder', () => expect(fs.existsSync(testPath)).to.be.true);
      it('creates a package.json', () => expect(fs.existsSync(`${testPath}/package.json`)).to.be.true);
      it('creates a component.json', () => expect(fs.existsSync(`${testPath}/component.json`)).to.be.true);
      it('creates verifyCredentials.js', () => expect(fs.existsSync(`${testPath}/verifyCredentials.js`)).to.be.true);
      it('creates a lib folder', () => expect(fs.existsSync(`${testPath}/lib`)).to.be.true);
      it('creates a spec folder', () => expect(fs.existsSync(`${testPath}/spec`)).to.be.true);
      it('creates the \'None right now / Other\' client file', () => {
        expect(fs.existsSync(`${testPath}/lib/testClient.js`)).to.be.true;
        const client = fs.readFileSync(`${testPath}/lib/TestClient.js`).toString();
        expect(client).to.include('TestClient');
        expect(client).to.include('NoAuthRestClient');
      });
      it('creates the client spec file', () => expect(fs.existsSync(`${testPath}/spec/testClient.spec.js`)).to.be.true);
      it('creates a .gitignore', () => expect(fs.existsSync(`${testPath}/.gitignore`)).to.be.true);
      it('creates a README.md', () => expect(fs.existsSync(`${testPath}/README.md`)).to.be.true);
      it('creates a CHANGELOG.md', () => expect(fs.existsSync(`${testPath}/CHANGELOG.md`)).to.be.true);
      it('creates a config.yml inside .circleci/', () => expect(fs.existsSync(`${testPath}/.circleci/config.yml`)).to.be.true);
      it('doesn\'t create a license', () => expect(fs.existsSync(`${testPath}/LICENSE`)).to.be.false);
      it('doesn\'t create a logo', () => expect(fs.existsSync(`${testPath}/logo.png`)).to.be.false);
    });

    describe('Advanced prompts', () => {
      const prompts = {
        componentTitle: 'test',
        componentName: 'test-component',
        logo: 'https://app.elastic.io/img/logo.svg',
        license: 'MIT',
        licenseName: 'John Smith',
        credentials: ['API Key', 'URL', 'OAuth2'],
        authentication: 'oauth2',
        eslint: true,
        npmInstall: true,
      };

      before(async () => { await run(prompts); });
      after(() => {
        console.log('Removing test directory. This may take a while.');
        rimraf.sync(path.resolve(prompts.componentName));
      });

      it('creates a component folder', () => expect(fs.existsSync(testPath)).to.be.true);
      it('creates a package.json', () => expect(fs.existsSync(`${testPath}/package.json`)).to.be.true);
      it('creates a component.json with the expected credential fields', () => {
        expect(fs.existsSync(`${testPath}/component.json`)).to.be.true;
        const componentJson = JSON.parse(fs.readFileSync(`${testPath}/component.json`));
        expect(componentJson.title).to.equal(prompts.componentName);
        expect(componentJson.credentials.fields).to.deep.equal({
          apiKey: {
            label: 'API Key',
            viewClass: 'PasswordFieldView',
            required: true,
          },
          url: {
            label: 'URL',
            viewClass: 'TextFieldView',
            required: true,
          },
          oauth: {
            label: 'OAuth2 Token',
            viewClass: 'OAuthFieldView',
            required: true,
          },
        });
      });
      it('creates verifyCredentials.js', () => expect(fs.existsSync(`${testPath}/verifyCredentials.js`)).to.be.true);
      it('creates a lib folder', () => expect(fs.existsSync(`${testPath}/lib`)).to.be.true);
      it('creates a spec folder', () => expect(fs.existsSync(`${testPath}/spec`)).to.be.true);
      it('creates the \'None right now / Other\' client file', () => {
        expect(fs.existsSync(`${testPath}/lib/TestClient.js`)).to.be.true;
        const client = fs.readFileSync(`${testPath}/lib/testClient.js`).toString();
        expect(client).to.include('TestClient');
        expect(client).to.include('OAuth2RestClient');
      });
      it('creates the client spec file', () => expect(fs.existsSync(`${testPath}/spec/testClient.spec.js`)).to.be.true);
      it('creates a .gitignore', () => expect(fs.existsSync(`${testPath}/.gitignore`)).to.be.true);
      it('creates a README.md', () => expect(fs.existsSync(`${testPath}/README.md`)).to.be.true);
      it('creates a CHANGELOG.md', () => expect(fs.existsSync(`${testPath}/CHANGELOG.md`)).to.be.true);
      it('creates a config.yml inside .circleci/', () => expect(fs.existsSync(`${testPath}/.circleci/config.yml`)).to.be.true);
      it('creates an .eslintrc.js', () => expect(fs.existsSync(`${testPath}/.eslintrc.js`)).to.be.true);
      it('creates the requested MIT license', () => {
        expect(fs.existsSync(`${testPath}/LICENSE`)).to.be.true;
        const license = fs.readFileSync(`${testPath}/LICENSE`).toString();
        expect(license).to.include('MIT');
        expect(license).to.include(new Date().getFullYear());
        expect(license).to.include(prompts.licenseName);
      });
      it('creates the elastic.io logo.png', () => {
        expect(fs.existsSync(`${testPath}/logo.png`)).to.be.true;
        expect(fs.statSync(`${testPath}/logo.png`).size).to.equal(4379);
      });
      it('creates node_modules', () => expect(fs.existsSync(`${testPath}/node_modules`)).to.be.true);
    });
  });
});

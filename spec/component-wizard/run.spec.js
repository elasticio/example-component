/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { run } = require('../../lib/component-wizard/run');

const prompts = {
  componentTitle: 'test',
  componentName: 'test-component',
  logo: '',
  license: 'None right now',
  credentials: [],
  authentication: 'basic',
  eslint: false,
};

describe('Tests for component CLI tool', () => {
  describe('File creations', () => {
    afterEach(() => rimraf.sync(path.resolve('test-component')));

    it('Creates a component folder', async () => {
      await run(prompts);
      expect(fs.existsSync(path.resolve('test-component'))).to.be.true;
    });
  });
});

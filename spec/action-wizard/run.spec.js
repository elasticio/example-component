/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { run } = require('../../lib/action-wizard/run');
const {
  objectType, allowEmptyResult, allowCriteriaToBeOmitted, emitBehaviour, startTime, endTime, pageSize, singlePagePerInterval,
} = require('../../lib/action-wizard/componentFields');

const prompts = {
  title: 'Test',
  id: 'test',
  description: 'This is a test',
  oih: true,
  actionType: 'lookupObject',
  metadata: 'Static',
};

describe('Tests for action/trigger CLI tool', () => {
  describe('File creations', () => {
    before(async () => {
      if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
      process.chdir('test-component');
      await run(prompts, 'action');
    });

    after(() => {
      process.chdir('..');
      rimraf.sync('test-component');
    });

    it('creates an actions folder', () => {
      expect(fs.existsSync(path.resolve('lib/actions'))).to.be.true;
    });

    it('creates an actions file', () => {
      expect(fs.existsSync(path.resolve('lib/actions/test.js'))).to.be.true;
    });

    it('creates test files', () => {
      expect(fs.existsSync(path.resolve('spec/actions/test.spec.js'))).to.be.true;
      expect(fs.existsSync(path.resolve('spec-integration/actions/test.spec.js'))).to.be.true;
    });

    it('Creates schema files', () => {
      expect(fs.existsSync(path.resolve('lib/schemas/test.in.json'))).to.be.true;
      expect(fs.existsSync(path.resolve('lib/schemas/test.out.json'))).to.be.true;
    });
  });

  describe('File create for dynamic metadata', () => {
    before(async () => {
      if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
      process.chdir('test-component');
      const newPrompts = { ...prompts, id: 'dynamic', metadata: 'Dynamic' };
      await run(newPrompts, 'action');
    });

    after(() => {
      process.chdir('..');
      rimraf.sync('test-component');
    });

    it('Does not create schema files', () => {
      expect(fs.existsSync('lib/schemas/dynamic.in.json')).to.be.false;
      expect(fs.existsSync('lib/schemas/dynamic.out.json')).to.be.false;
    });
  });

  describe('Component.json', () => {
    describe('General adding action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: null };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds the action to component.json', () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test).to.be.deep.equal({
          main: './lib/actions/test.js',
          title: 'Test',
          description: 'This is a test',
          metadata: {
            in: './lib/schemas/test.in.json',
            out: './lib/schemas/test.out.json',
          },
        });
      });

      it('adds the correct fields for lookup action', async () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test).to.be.deep.equal({
          main: './lib/actions/test.js',
          title: 'Test',
          description: 'This is a test',
          metadata: {
            in: './lib/schemas/test.in.json',
            out: './lib/schemas/test.out.json',
          },
        });
      });
    });

    describe('Adding lookup action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: 'lookupObject' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds the correct fields for lookup action', async () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test.fields).to.be.deep.equal({
          objectType,
          allowEmptyResult,
          allowCriteriaToBeOmitted,
        });
      });
    });

    describe('Adding lookup plural action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: 'lookupObjects' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds the correct fields for lookup plural action', async () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test.fields).to.be.deep.equal({ emitBehaviour });
      });
    });

    describe('Adding upsert action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: 'upsert' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds the correct fields for upsert action', async () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test.fields).to.be.deep.equal({ objectType });
      });
    });

    describe('Adding delete action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: 'delete' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds the correct fields for delete action', async () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test.fields).to.be.deep.equal({ objectType });
      });
    });

    describe('Adding get new and updated polling action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, webhookOrPolling: 'polling', actionType: 'getNewAndUpdated' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'trigger');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds the correct fields for get new and updated polling trigger', async () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.triggers.test.fields).to.be.deep.equal({
          objectType,
          startTime,
          endTime,
          pageSize,
          singlePagePerInterval,
        });
      });
    });

    describe('General adding action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: null, metadata: 'Dynamic' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds dynamic metadata field', () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test.dynamicMetadata).to.be.true;
      });
    });

    describe('General adding action/trigger', () => {
      before(async () => {
        const newPrompts = { ...prompts, actionType: null, metadata: 'Static' };
        if (!fs.existsSync('test-component')) fs.mkdirSync('test-component');
        process.chdir('test-component');
        await run(newPrompts, 'action');
      });

      after(() => {
        process.chdir('..');
        rimraf.sync('test-component');
      });

      it('adds dynamic metadata field', () => {
        const component = JSON.parse(fs.readFileSync(path.resolve('component.json')));
        expect(component.actions.test.metadata).to.be.deep.equal({
          in: './lib/schemas/test.in.json',
          out: './lib/schemas/test.out.json',
        });
      });
    });
  });
});

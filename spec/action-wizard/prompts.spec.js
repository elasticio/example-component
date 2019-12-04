/* eslint-disable no-unused-expressions */
const { expect } = require('chai');
const prompts = require('../../lib/action-wizard/prompts');

describe('Tests for Action/Trigger prompts', () => {
  let result;

  describe('Tests for actions', () => {
    before(() => { result = prompts('action'); });

    it('Asks for the actions name', () => {
      expect(result[0]).to.be.deep.equal({
        type: 'input',
        name: 'title',
        message: 'What is your action\'s name?',
      });
    });

    it('Gets the correct action ID', () => {
      const id = result[1].default({ title: 'TestingTesting' });
      expect(id).to.be.equal('testingTesting');
    });

    it('Asks for action/trigger description', () => {
      expect(result[2]).to.be.deep.equal({
        type: 'input',
        name: 'description',
        message: 'Please provide a description for your action',
        default: '',
      })
    })

    it('Does not ask webhook or polling', () => {
      const when = result[3].when();
      expect(when).to.be.false;
    });

    it('Asks if should use OIH', () => {
      expect(result[4]).to.be.deep.equal({
        type: 'confirm',
        name: 'oih',
        message: 'Would you like to build your action off the OIH standard library?',
      });
    });

    it('Gives the correct OIH options', () => {
      expect(result[5].choices()).to.be.deep.equal([
        {
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
        },
      ]);
      expect(result[5].when({ oih: false })).to.be.false;
      expect(result[5].when({ oih: true })).to.be.true;
    });

    it('Asks for metadata', () => {
      expect(result[6]).to.be.deep.equal({
        type: 'list',
        name: 'metadata',
        message: 'What kind of metadata would you like to use for you action?',
        choices: ['Static', 'Dynamic', {
          name: 'No Metadata',
          value: 'none',
        }],
      });
    });
  });

  describe('Tests for trigger', () => {
    before(() => { result = prompts('trigger'); });

    it('Asks webhook or polling', () => {
      expect(result[3].when()).to.be.true;
    });

    it('Gives the correct OIH options', () => {
      expect(result[5].choices()).to.be.deep.equal([{
        name: 'Get New and Updated Objects Polling',
        value: 'getNewAndUpdated',
      }, {
        name: 'Webhook trigger',
        value: 'webhook',
      }]);
    });
  });
});

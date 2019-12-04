const inquirer = require('inquirer');
const Listr = require('listr');
const fs = require('fs');
const path = require('path');
const store = require('mem-fs').create();
const memFsEditor = require('mem-fs-editor');

const editor = memFsEditor.create(store);

const questions = require('./prompts');
const {
  objectType, allowEmptyResult, allowCriteriaToBeOmitted, emitBehaviour, startTime, endTime, pageSize, singlePagePerInterval,
} = require('./componentFields');

async function run(answers, actTrig) {
  const action = `${actTrig}s`;
  const {
    title, id, actionType, metadata, webhookOrPolling, description,
  } = answers;
  const tasks = new Listr([
    {
      title: `Checking for ${action} folder`,
      task: () => {
        if (!fs.existsSync('lib')) {
          fs.mkdirSync('lib', (err) => err);
        }
        if (!fs.existsSync(`lib/${action}`)) {
          fs.mkdirSync(`lib/${action}`, (err) => err);
        }
      },
    }, {
      title: `Creating ${actTrig} file`,
      task: async () => {
        const data = metadata === 'Dynamic' ? '\nexports.getMetaModel = async function getMetaModel(cfg) {\n\n};' : '';
        editor.copyTpl(path.resolve(__dirname, 'templates/action.js'), path.resolve(`lib/${action}/${id}.js`),
          { metadata: data });
      },
    }, {
      title: `Adding ${actTrig} to component.json`,
      task: async () => {
        if (!fs.existsSync('component.json')) {
          fs.writeFileSync(path.resolve('component.json'), '{}', (err) => err);
        }

        const component = editor.readJSON('component.json');
        if (!component[action]) component[action] = {};
        component[action][id] = {
          main: `./lib/${action}/${id}.js`,
          title,
          description,
        };

        switch (actionType) {
          case 'lookupObject':
            component[action][id].fields = {
              objectType,
              allowEmptyResult,
              allowCriteriaToBeOmitted,
            };
            break;
          case 'lookupObjects':
            component[action][id].fields = {
              emitBehaviour,
            };
            break;
          case 'delete': case 'upsert': case 'create': case 'webhook':
            component[action][id].fields = {
              objectType,
            };
            break;
          case 'getNewAndUpdated':
            component[action][id].fields = {
              objectType,
              startTime,
              endTime,
              pageSize,
              singlePagePerInterval,
            };
            break;
          default: break;
        }

        if (webhookOrPolling === 'Polling') component[action][id].type = 'polling';
        if (metadata === 'Dynamic') component[action][id].dynamicMetadata = true;
        if (metadata === 'Static') {
          component[action][id].metadata = {
            in: `./lib/schemas/${id}.in.json`,
            out: `./lib/schemas/${id}.out.json`,
          };
        }

        editor.writeJSON('component.json', component);
      },
    }, {
      title: metadata === 'Static' ? 'Creating schema files' : 'Skipping schema files',
      // eslint-disable-next-line consistent-return
      skip: () => { if (metadata !== 'Static') return 'No schema files necessary'; },
      task: async () => {
        if (!fs.existsSync('lib/schemas')) {
          fs.mkdirSync('lib/schemas', (err) => err);
        }
        editor.writeJSON(`lib/schemas/${id}.in.json`, {});
        editor.writeJSON(`lib/schemas/${id}.out.json`, {});
      },
    }, {
      title: 'Create spec file',
      task: () => {
        if (!fs.existsSync('spec')) {
          fs.mkdirSync('spec', (err) => err);
        }

        if (!fs.existsSync(`spec/${action}`)) {
          fs.mkdirSync(`spec/${action}`, (err) => err);
        }

        if (!fs.existsSync(`spec/${action}/${id}.spec.js`)) {
          editor.copyTpl(path.resolve(__dirname, 'templates/spec.js'), path.resolve(`spec/${action}/${id}.spec.js`),
            { require: `const ${actTrig} = require('../../lib/${action}/${id}.js');` });
        }
      },
    }, {
      title: 'Create spec-integration file',
      task: () => {
        if (!fs.existsSync('spec-integration')) {
          fs.mkdirSync('spec-integration', (err) => err);
        }

        if (!fs.existsSync(`spec-integration/${action}`)) {
          fs.mkdirSync(`spec-integration/${action}`, (err) => err);
        }

        if (!fs.existsSync(`spec-integration/${action}/${id}.spec.js`)) {
          editor.copyTpl(path.resolve(__dirname, 'templates/spec-integration.js'), path.resolve(`spec-integration/${action}/${id}.spec.js`),
            { require: `const ${actTrig} = require('../../lib/${action}/${id}.js');` });
        }
      },
    }, {
      title: 'Finalizing',
      task: () => { editor.commit((err) => err); },
    },
  ]);
  try {
    await tasks.run();
  } catch (err) {
    console.error(err);
  }
}

function prompt(actionOrTrigger) {
  inquirer.prompt(questions(actionOrTrigger)).then(async (response) => {
    await run(response, actionOrTrigger);
  });
}

module.exports = {
  prompt,
  run,
};

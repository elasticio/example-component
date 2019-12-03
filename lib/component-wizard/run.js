const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { execSync } = require('child_process');
const fs = require('fs');
const inquirer = require('inquirer');
const Listr = require('listr');
const _ = require('lodash');
const store = require('mem-fs').create();
const memFsEditor = require('mem-fs-editor');
const constants = require('./templates/constants');
const questions = require('./prompts');

const editor = memFsEditor.create(store);

async function run(answers) {
  const {
    componentTitle, componentName, logo, license, licenseName,
    credentials, authentication, eslint, npmInstall,
  } = answers;
  const componentTitlePascal = _.upperFirst(_.camelCase(componentTitle));

  if (fs.existsSync(componentName)) {
    throw new Error(`${componentName} folder already exists.`);
  }

  const tasks = new Listr([
    {
      title: `Creating ${componentName} folder`,
      task: () => {
        fs.mkdirSync(componentName);
      },
    }, {
      title: 'Queuing package.json',
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/package.json`,
          `${componentName}/package.json`,
          { componentName },
        );
      },
    }, {
      title: 'Creating component.json with requested credentials',
      task: () => {
        const componentJson = JSON.parse(fs.readFileSync(`${constants.TEMPLATE_PATH}/component.json`));
        componentJson.title = componentName;
        componentJson.credentials.fields = credentials.reduce(
          // eslint-disable-next-line max-len
          (fieldsAcc, credential) => Object.assign(fieldsAcc, constants.CREDENTIAL_MAP.get(credential)),
          {},
        );
        fs.writeFileSync(`${componentName}/component.json`, JSON.stringify(componentJson, null, 2));
      },
    }, {
      title: 'Queuing verifyCredentials.js',
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/verifyCredentials.js`,
          `${componentName}/verifyCredentials.js`,
          { componentTitlePascal },
        );
      },
    }, {
      title: 'Creating lib folder',
      task: () => { fs.mkdirSync(`${componentName}/lib`); },
    }, {
      title: 'Creating spec folder',
      task: () => { fs.mkdirSync(`${componentName}/spec`); },
    }, {
      title: 'Queuing requested client file',
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/clients/${authentication}.js`,
          `${componentName}/lib/${componentTitle}Client.js`,
          { componentTitlePascal },
        );
      },
    }, {
      title: 'Queuing client spec tests',
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/clients/client.spec.js`,
          `${componentName}/spec/${componentTitle}Client.spec.js`,
          { componentTitle, componentTitlePascal },
        );
      },
    }, {
      title: 'Queuing .gitignore',
      task: () => {
        editor.copy(
          `${constants.TEMPLATE_PATH}/.gitignore`,
          `${componentName}/.gitignore`,
        );
      },
    }, {
      title: 'Queuing README.md',
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/README.md`,
          `${componentName}/README.md`,
          { componentName: `${componentName} Component` },
        );
      },
    }, {
      title: 'Queuing CHANGELOG.md',
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/CHANGELOG.md`,
          `${componentName}/CHANGELOG.md`,
          { date: `${new Date().toLocaleString('en-us', { month: 'long', day: '2-digit', year: 'numeric' })}` },
        );
      },
    }, {
      title: 'Creating .circleci folder',
      task: () => { fs.mkdirSync(`${componentName}/.circleci`); },
    }, {
      title: 'Queuing config.yml',
      task: () => {
        editor.copy(
          `${constants.TEMPLATE_PATH}/config.yml`,
          `${componentName}/.circleci/config.yml`,
        );
      },
    }, {
      title: eslint ? 'Queuing eslint' : 'Skipping eslint',
      // eslint-disable-next-line consistent-return
      skip: () => { if (!eslint) return 'None requested'; },
      task: () => {
        editor.copy(
          `${constants.TEMPLATE_PATH}/.eslintrc.js`,
          `${componentName}/.eslintrc.js`,
        );
      },
    }, {
      title: constants.LICENSE_MAP.get(license) ? `Queuing ${license} license` : 'Skipping license',
      // eslint-disable-next-line consistent-return
      skip: () => { if (!constants.LICENSE_MAP.get(license)) return 'None requested'; },
      task: () => {
        editor.copyTpl(
          `${constants.TEMPLATE_PATH}/licenses/${constants.LICENSE_MAP.get(license)}`,
          `${componentName}/LICENSE`,
          {
            year: new Date().getFullYear(),
            licenseName,
          },
        );
      },
    }, {
      title: logo ? 'Fetching logo' : 'Skipping logo',
      // eslint-disable-next-line consistent-return
      skip: () => { if (!logo) return 'None requested'; },
      task: async () => {
        fs.writeFileSync(
          `${componentName}/logo.png`,
          (await new AttachmentProcessor().getAttachment(logo, 'arraybuffer')).data,
        );
      },
    }, {
      title: 'Committing files...',
      task: () => {
        editor.commit(() => {
          console.log('Successfully committed!');
          if (npmInstall) {
            try {
              console.log('npm installing...');
              process.chdir(componentName);
              execSync('npm install');
              process.chdir('..');
              console.log('npm install succeeded');
            } catch (err) {
              console.error('Failed to npm install');
              console.error(err);
            }
          } else {
            console.log('Don\'t forget to npm install!');
          }
        });
      },
    },
  ]);

  try {
    await tasks.run();
  } catch (err) {
    console.error(err);
  }
}

function prompt() {
  inquirer.prompt(questions).then(async (response) => {
    await run(response);
  });
}

module.exports = {
  prompt,
  run,
};

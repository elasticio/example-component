const fs = require('fs');
const inquirer = require('inquirer');
const Listr = require('listr');
const questions = require('./prompts');

async function run(answers) {
  const {
    componentTitle, componentName, logo, license, credentials, authentication, eslint,
  } = answers;
  const tasks = new Listr([
    {
      title: 'Creating Directory',
      task: () => { fs.mkdir(componentName, (err) => err); },
    },
  ]);
  await tasks.run().catch((e) => e);
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

const inquirer = require('inquirer');
const questions = require('./prompts');

async function run(answers, actTrig) {
  return answers;
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

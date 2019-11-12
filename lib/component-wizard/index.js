const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');

let answers;

inquirer.prompt([
  {
    type: 'list',
    name: 'testQuestion',
    message: () => chalk.cyan('Are you excited to explore building CLI tools?'),
    choices: ['yes', 'YESSS'],
  },
]).then((response) => {
  answers = response;
});

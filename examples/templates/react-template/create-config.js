const path = require('path');
const api = require('./../../../');

module.exports = {
  id: 'react-template',
  files: ['src/**'],
  questions: [{
    type: 'input',
    name: 'componentName',
    message: 'What is the name for the React Component?'
  }],
  createTemplateArgs: async (answers) => {
    return api.createArgs(answers);
  },
  resolveDestinationFolder: async (cwd, args) => {
    console.log(cwd, args);

    return path.join(cwd, args.componentName.kebabCase);
  }
};

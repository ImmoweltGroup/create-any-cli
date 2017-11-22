const path = require('path');
const {argv} = require('yargs');

module.exports = {
  id: 'react-component',
  resolveFiles: async () => ['src/*'],
  resolveQuestions: async (cwd) => [{
    type: 'input',
    name: 'npmScope',
    message: 'What is the NPM organization scope for the React Component?',
    default: argv.npmScope,
    filter: str => {
      if (str && str.length) {
        return `@${str.replace(/\W/g, '')}/`
      }

      return '';
    }
  }, {
    type: 'input',
    name: 'name',
    message: 'What is the name for the React Component?',
    default: argv.name,
    validate: Boolean
  }],
  resolveDestinationFolder: async (args, cwd) => {
    const distDir = argv.dist || 'examples/results';

    return path.join(cwd, distDir, args.name.kebabCase);
  }
};

const path = require('path');
const {argv} = require('yargs');

/**
 * Template for a simple react-component package.
 *
 * @param {String} name     The name of the Component to create.
 * @param {String} npmScope The optional npm-scope for the Component.
 * @param {String} dist     The relative path from the cwd of the CLI where the template will be moved into.
 *
 * @example create react-component --name="Foo Bar" --dist="examples/results"
 */
module.exports = {
  id: 'react-component',
  resolveFiles: async () => ['*/**'],
  resolveQuestions: async (cwd) => [{
    type: 'input',
    name: 'npmScope',
    message: 'What is the NPM organization scope for the React Component?',
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
    validate: Boolean
  }],
  resolveDestinationFolder: async (answers, cwd) => {
    const distDir = argv.dist || 'examples/results';

    return path.join(cwd, distDir);
  }
};

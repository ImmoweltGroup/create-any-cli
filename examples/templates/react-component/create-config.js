const path = require('path');

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
  description: 'A basic template example on how the create CLI can be used.',
  resolveQuestions: async (flags) => [{
    type: 'input',
    name: 'name',
    message: 'What is the name for the React Component?',
    validate: Boolean
  }, {
    type: 'input',
    name: 'npmScope',
    message: 'What is the NPM organization scope for the React Component? (Optional)',
    filter: str => {
      if (str && str.length) {
        return `@${str.replace(/\W/g, '')}/`
      }

      return '';
    }
  }, {
    type: 'input',
    name: 'dist',
    message: 'What is target folder for the template? (Optional)',
    filter: str => {
      return str || flags.dist || 'examples/results';
    }
  }],
  resolveFiles: async (answers, flags) => ['*/**'],
  resolveDestinationFolder: async (answers, args, flags) => {
    return path.join(process.cwd(), answers.dist);
  }
};

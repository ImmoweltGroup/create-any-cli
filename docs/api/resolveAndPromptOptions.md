# `resolveAndPromptOptions(questions: Array, cliFlags: Object, hooks: Object)`
Tries to resolve answers from either the CLI flags object provided or creates an interactive prompt with `inquirer.js`. Supports all options of the inquirer question format like `filter` or `validate`.

#### Example usage
```js
const meow = require('meow');
const {resolveAndPromptOptions} = require('create-any-cli');

(async function () {
  const cli = meow();
  const questions = [
    name: 'foo',
    description: 'my foo arg'
  ];
  const answers = await processTemplateAndCreate(questions, cli.flags);
})();
```


### Options
#### `questions: Array`
The list of [Inquirer.js prompt options](https://github.com/SBoudrias/Inquirer.js#questions) to either resolve from the CLI or the interactive prompt to spawn.

#### `cliFlags: Object`
The object of CLI flags to parse, the key will be compared with the inquirer options `name`, if it's matching the value will be used and no interactive prompt will be created for this questions object.

### Options (Hooks)
#### `opts.hooks: Object`
The object that holds all configuration options regarding the hook functions.

#### `opts.hooks.onImplicitQuestion: Function`
Optional hook function that will be called with the question object that will be omitted and the value from the `cliFlags` object. The hook function needs to return the hook object after processing/logging it.

#### `opts.hooks.onInteractiveQuestion: Function`
Optional hook function that will be called with the question object that will be prompted to the user. The hook function needs to return the hook object after processing/logging it.

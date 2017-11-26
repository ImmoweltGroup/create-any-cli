# Template Configuration

As stated earlier, we aim to be as flexible as possible with the template configuration, by default you are only required to export one property in your template configuration, the remaining options are optional and will be replaced by fallbacks if not provided. Besides the required property to export, the config file needs to be named `create-config.js`, since this is the only way for us to recognize template configurations from regular files.

#### Example configuration
```js
// create-config.js
const path = require('path');

module.exports = {
  id: 'my-template'
};
```

### Template engine/syntax
Internally we use the [`doT` template engine](https://olado.github.com/doT) since it is pretty fast and has a convincing API. All file contents as well as their paths will be piped into the template engine with the arguments returned from the `createTemplateArgs` option, this enables you to even use template variables as folder names without any effort. The template syntax is pretty straight forward, just paste in `{{=it.NAME_OF_THE_KEY}}` and replace `NAME_OF_THE_KEY` with the variable key you want to print. You can also use native JS methods like `toUpperCase()` on strings and many more.

In the future we will support custom template engines and template settings for `doT` that you can specify in your template configuration.

### Options
All function options can return Promises or be written as `async` functions. While we expect a certain data type to be returned, you can return an Error Object at any point in time, in which case we will pretty print it into the users console and abort the templating process.

#### `opts.id: String`
A unique ID for this template, the value reflects the name of the template since users of the CLI can...

* ... interactively choose from a set of resolved templates when executing the CLI without any arguments, e.g. `create`.
* ... specify a template-id upfront to skip the interactive prompt, .e.g `create my-template`.

#### `opts.description: String` (Optional)
A description for this template. It will be rendered into the users console if he asks for a manual / help regarding this particular template, e.g. `create my-template --help` or `create my-template -h`. **Note that you don't need to list command line options in this string since they will be automatically parsed and generated in the help output via the `resolveQuestions` option!**

#### `opts.resolveQuestions: () => Array<InquirerPromptObject>` (Optional)
A function that will be immediately invoked and should return an array of [Inquirer.js prompt options](https://github.com/SBoudrias/Inquirer.js#questions). Falls back to an function that returns an empty array, meaning no questions will be prompted.

#### `opts.resolveFiles: (answers: Object, flags: Object) => Array<string>` (Optional)
A function that will be invoked with the answers of the resolved questions and CLI flags. It should return a list of files or file-globs relative to the `create-config.js` file. Falls back to an function that returns an array with a wildcard, meaning that all files except for the `create-config.js` relative to it will be copied and processed.

#### `opts.createTemplateArgs: (answers: Object, flags: Object) => Object` (Optional)
A function that will be invoked with the answers of the resolved questions and CLI flags. It should return the template arguments object. Falls back to the [`createDecoratedTemplateArgs`](/docs/api/createDecoratedTemplateArgs.md) function which should be fine for 99% of all use cases.

#### `opts.resolveDestinationFolder: (answers: Object, flags: Object) => Object` (Optional)
A function that will be invoked with the answers of the resolved questions and CLI flags. It should return the full path pointing to the folder in which all files should be moved into after processing their contents. Falls back to a function that returns the `process.cwd()`.

If the path/folder does not exist it will be created, be aware that we require the folder to be empty, if that is not the case the scaffold will not be moved into the directory.

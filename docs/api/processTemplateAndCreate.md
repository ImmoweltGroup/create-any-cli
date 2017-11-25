# `processTemplateAndCreate(opts: Object)`
Powerful template processor function with support for file-patterns, ignore-patterns, template arguments, template settings and various hook functions with which you can control the flow of the templating process.

#### Example usage
```js
const {processTemplateAndCreate} = require('create-any-cli');

(async function () {
  await processTemplateAndCreate({
    dist: '/the/final/destination',
    template: {
      src: 'the/template/source',
      args: {
        foo: 'bar'
      }
    }
  });
})();
```


### Options
#### `opts.dist: String`
The full path to which the template files and folder structure will be moved into. This folder needs to be empty and if it is not yet existing the util will create the full path.


### Options (Template)
#### `opts.template: Object`
The object that holds all configuration options regarding the template.

#### `opts.template.src: String`
The full path to the template location, all filePatterns will be relative to this directory.

#### `opts.template.args: Object`
The template arguments which will be propagated to the `doT` template engine.

#### `opts.template.filePatterns: Array<string>`
Optional list of file patterns to use when resolving the template files. Defaults to `['*/**']`.

#### `opts.template.ignore: Array<string>`
Optional list of ignore patterns to use when resolving the template files. Defaults to `[]`.

#### `opts.template.settings: Object`
Optional template settings for the `doT` template engine, please refer to the [official documentation](http://olado.github.io/doT/) of `doT` for more information.


### Options (Hooks)
#### `opts.hooks: String`
The object that holds all configuration options regarding the hook functions.

#### `opts.hooks.onInvalidDistDir: Function`
Optional hook function that will be called if the `distDir` is not empty.

#### `opts.hooks.onFile: Function`
Optional hook function that will be called on each file to process, this function can return a context object that will be propagated to all file based hook functions.

#### `opts.hooks.onBeforeReadFile: Function`
Optional hook function that will be called on each file to read (before).

#### `opts.hooks.onAfterReadFile: Function`
Optional hook function that will be called on each file to read (after).

#### `opts.hooks.onBeforeProcessFile: Function`
Optional hook function that will be called on each file to process with the `doT` template engine (before).

#### `opts.hooks.onAfterProcessFile: Function`
Optional hook function that will be called on each file to process with the `doT` template engine (after).

#### `opts.hooks.onBeforeWriteFile: Function`
Optional hook function that will be called on each file to write to the disk (before).

#### `opts.hooks.onAfterWriteFile: Function`
Optional hook function that will be called on each file to write to the disk (after).

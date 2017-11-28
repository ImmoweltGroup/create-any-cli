# API Reference

We only expose a certain set of core functionalities in our Node API to build your own `create-*` CLI, internals that are not listed here should be seen as experimental and are subject to change.

### Top-Level Exports

* [createDecoratedTemplateArgs(argsByKey: {[string]: mixed})](createDecoratedTemplateArgs.md)
* [processTemplateAndCreate(opts: Object)](processTemplateAndCreate.md)
* [resolveAndPromptOptions(questions: Array, cliFlags: Object, hooks: Object)](resolveAndPromptOptions.md)

### Importing

Every function described above is a top-level export. You can import any of them like this:

```js
const {createDecoratedTemplateArgs} = require('create-any-cli');
```

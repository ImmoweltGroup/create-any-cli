# Template Creation

Creating templates is easy as pie, after configuring the CLI to resolve the templates from a set of directories, let's head into one and create the templates configuration file, e.g. `templates/my-template/create-config.js` and paste the following contents into it.

```js
// create-config.js
const path = require('path');

module.exports = {
  id: 'my-template',
  description: 'A basic template example on how the `create` CLI can be used.',
  resolveFiles: async () => ['*'],
  resolveQuestions: async () => [{
    type: 'input',
    name: 'name',
    message: 'What is the name for the module to create?',
    validate: Boolean
  }],
  resolveDestinationFolder: async (answers) => {
    return path.join(process.cwd(), 'src', answers.name.kebabCase);
  }
};
```

Let's finalize everything by creating a `index.js` file that will be picked up by the `create` CLI during the template process.

```js
// index.js

console.log('This string should automatically be replaced "{{=it.name.camelCase}}"');
```

Let's save the file and execute `create` in the root of your project and answer all questions that are popping up.

```sh
create
```

The CLI should now created a directory within `src` with the contents of your processed template. Note that this example configuration does not reflect the necessary options, it is just an example that should get you familiar with the API and the possibilities. To max out the full potential of the CLI and it's API we recommend you to take a look at [all options that are available](/docs/templates/Configuration.md) and the [examples provided in this repository](/examples/templates).

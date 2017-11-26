# CLI Configuration

Since we do not expect a certain directory structure, you first need to configure the CLI to resolve the templates. This can be done using either your projects `package.json` with the `create-any-cli` property, e.g.

```json
{
  "name": "my-fancy-package",
  "version": "1.0.0",
  "create-any-cli": {
    "templates": [
      "templates/*",
      "node_modules/create-any-cli/examples/*"
    ]
  }
}
```

... or even a raw config file named `.createrc` like we all know it from tools like ESLint or babel, e.g.

```json
{
  "templates": [
    "templates/*",
    "node_modules/create-any-cli/examples/*"
  ]
}
```

This way the CLI will resolve all templates relative to your projects root in `templates`. For demonstration purposes we also added `node_modules/create-any-cli/examples` so you can try out the CLI in all it's glory without having to create or install a template yourself. [Let's head to the Usage of the CLI](/docs/cli/Usage.md)!

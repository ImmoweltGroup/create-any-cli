# `createDecoratedTemplateArgs(argsByKey: {[string]: mixed})`
A neat helper function to decorate your template arguments with variants of the most popular naming conventions like `camelCase`, `snake_case`, `kebab-case` and many more.

#### Example usage
```js
const {createDecoratedTemplateArgs} = require('create-any-cli');

const args = {
  foo: 'Foo bar'
};
const decorated = createDecoratedTemplateArgs(args);

console.log(decorated);
//
// {
//    foo: {
//        raw: 'Foo bar',
//        upperCamelCase: 'FooBar',
//        snakeCase: 'foo_bar',
//        kebabCase: 'foo-bar',
//        camelCase: 'fooBar',
//        lowerCase: 'foo bar',
//        upperCase: 'FOO BAR'
//    }
// }
//
```

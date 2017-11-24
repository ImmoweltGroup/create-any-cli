// @flow

import type {
  DecoratedTemplateArgsType,
  FilePatternListType,
  TemplateArgsType,
  TemplateHookArgsType
} from './../types.js';

const path = require('path');
const dot = require('dot');
const lodash = require('lodash');
const file = require('./file.js');

module.exports = {
  /**
   * Creates an templates arg object to be used with your template engine.
   *
   * @param {Object} argsByKey The raw arguments by their keys.
   * @return {Object}          The input object transformed into an object with variant properties of the raw value.
   */
  createDecoratedTemplateArgs(argsByKey: {
    [string]: string
  }): DecoratedTemplateArgsType {
    const variants = [
      'snakeCase',
      'kebabCase',
      'camelCase',
      'lowerCase',
      'startCase',
      'upperCase'
    ];

    return Object.keys(argsByKey).reduce(
      (args: DecoratedTemplateArgsType, argKey: string) => {
        const raw = argsByKey[argKey];
        const transformedArgs: Object = {
          raw,
          upperCamelCase: lodash.upperFirst(lodash.camelCase(raw))
        };

        variants.forEach(methodName => {
          // $FlowFixMe: suppressing this error since the access to the methods should not fail if reviewed properly.
          const method = lodash[methodName];

          transformedArgs[methodName] = method(raw);
        });

        args[argKey] = transformedArgs;

        return args;
      },
      {}
    );
  },

  /**
   * Processes the given "templateDir" and it's files with the arguments and moves the result into the "distDir".
   *
   * @param  {Object}  opts      Options for the templating process.
   * @return {Promise}           The Promise that resolves once the template got processed.
   */
  async processTemplateAndCreate(opts: {
    dist: string,
    template: {
      src: string,
      args: TemplateArgsType,
      filePatterns?: FilePatternListType,
      ignore?: FilePatternListType,
      settings?: Object | void
    },
    hooks?: {
      onFile?: (opts: TemplateHookArgsType) => Promise<Object> | Object,
      onInvalidDistDir?: (distDir: string) => Promise<*> | void,
      onBeforeReadFile?: (opts: TemplateHookArgsType) => Promise<*> | void,
      onAfterReadFile?: (opts: TemplateHookArgsType) => Promise<*> | void,
      onBeforeProcessFile?: (opts: TemplateHookArgsType) => Promise<*> | void,
      onAfterProcessFile?: (opts: TemplateHookArgsType) => Promise<*> | void,
      onBeforeWriteFile?: (opts: TemplateHookArgsType) => Promise<*> | void,
      onAfterWriteFile?: (opts: TemplateHookArgsType) => Promise<*> | void
    }
  }): Promise<void> {
    const emptyFn = () => null;
    const options = lodash.merge(
      {
        template: {
          filePatterns: ['*/**'],
          ignore: [],
          settings: undefined
        },
        hooks: {
          onFile: () => ({}),
          onInvalidDistDir: emptyFn,
          onBeforeReadFile: emptyFn,
          onAfterReadFile: emptyFn,
          onBeforeProcessFile: emptyFn,
          onAfterProcessFile: emptyFn,
          onBeforeWriteFile: emptyFn,
          onAfterWriteFile: emptyFn
        }
      },
      opts
    );
    const {dist, hooks} = options;
    const {src, filePatterns, args, ignore} = options.template;

    //
    // Ensure that the directory exists and is empty.
    //
    await file.ensureDir(dist);

    const existingDistFiles = await file.readdirAsync(dist);

    if (existingDistFiles.length) {
      return hooks.onInvalidDistDir(dist);
    }

    //
    // If the directory is empty, resolve all files based on the patterns and
    // process their dist paths and the contents.
    //
    const pathPatterns = filePatterns.map(pattern => path.join(src, pattern));
    const files = await file.globAsync(pathPatterns, {
      nodir: true,
      symlinks: false,
      ignore
    });

    for (let filePath of files) {
      const relativeFilePath = filePath
        .replace(src + path.sep, '')
        .replace(src, '');
      const filePaths = {
        src: relativeFilePath,
        dist: this.template(relativeFilePath, args, options.template.options)
      };
      let hookArgs: TemplateHookArgsType = {
        filePaths,
        context: {},
        data: {
          raw: '',
          processed: ''
        }
      };

      //
      // Prepare
      //
      const context = await hooks.onFile(hookArgs);
      hookArgs = lodash.merge({}, hookArgs, {
        context
      });

      //
      // Read file
      //
      await hooks.onBeforeReadFile(hookArgs);
      const contents = await file.readFileAsync(filePath, 'utf8');
      hookArgs = lodash.merge({}, hookArgs, {
        data: {
          raw: contents
        }
      });
      await hooks.onAfterReadFile(hookArgs);

      //
      // Process file
      //
      await hooks.onBeforeProcessFile(hookArgs);
      const data = this.template(contents, args, options.template.options);
      hookArgs = lodash.merge({}, hookArgs, {
        data: {
          processed: data
        }
      });
      await hooks.onAfterProcessFile(hookArgs);

      //
      // Write file
      //
      await hooks.onBeforeWriteFile(hookArgs);
      await file.writeFileAsync(path.join(dist, filePaths.dist), data);
      await hooks.onAfterWriteFile(hookArgs);
    }
  },

  /**
   * Creates a template function for the given string and executes it immediately with the arguments.
   *
   * @param  {String} str              The contents to process.
   * @param  {Object} args             The arguments to pass to the template fn.
   * @param  {Object} templateSettings An optional settings object to use.
   * @return {String}                  The processed template-
   */
  template(str: string, args: TemplateArgsType, templateSettings: Object = {}) {
    return dot.template(str, {
      ...templateSettings,
      ...dot.templateSettings,
      strip: false
    })(args);
  }
};

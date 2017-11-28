// @flow

import type {
  QuestionType,
  QuestionListType,
  DecoratedTemplateArgsType,
  FilePatternListType,
  TemplateArgsType,
  TemplateHookArgsType
} from './../types.js';

const path = require('path');
const dot = require('dot');
const lodash = require('lodash');
const inquirer = require('inquirer');
const file = require('./file.js');

module.exports = {
  /**
   * Creates an templates arg object to be used with your template engine.
   *
   * @param {Object} argsByKey The raw arguments by their keys.
   * @return {Object}          The input object transformed into an object with variant properties of the raw value.
   */
  createDecoratedTemplateArgs(argsByKey: {
    [string]: mixed
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
          upperCamelCase: lodash.upperFirst(lodash.camelCase(String(raw)))
        };

        variants.forEach(methodName => {
          // $FlowFixMe: suppressing this error since the access to the methods should not fail if reviewed properly.
          const method = lodash[methodName];

          transformedArgs[methodName] = method(String(raw));
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

    if (
      typeof hooks.onInvalidDistDir === 'function' &&
      existingDistFiles.length
    ) {
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
  },

  /**
   * Tries to resolve the answers of the given inquirer.js questions
   * either via the CLI options or via an interactive prompt.
   *
   * @param  {Array}  questions The list of inquirer questions to either resolve from the CLI or the interactive prompt.
   * @param  {Object}    hooks  An optional hooks object to modify / log the questions based on their type.
   * @return {Promise}          The Promise that resolves with the answers object of both the interactive prompt and the CLI.
   */
  async resolveAndPromptOptions(
    questions?: QuestionListType = [],
    flags?: Object = {},
    hooks?: {
      onImplicitQuestion: (
        question: QuestionType,
        value: mixed
      ) => Promise<QuestionType> | QuestionType,
      onInteractiveQuestion: (
        question: QuestionType
      ) => Promise<QuestionType> | QuestionType
    }
  ): Promise<{[string]: mixed}> {
    const interactiveQuestions = [];
    const implicitQuestions = [];
    const implicitAnswers: {[string]: mixed} = {};

    hooks = lodash.merge(
      {
        onImplicitQuestion: question => question,
        onInteractiveQuestion: question => question
      },
      hooks
    );

    for (let q of questions) {
      const {name, filter = val => val, validate = val => true} = q;
      const value = filter(flags[name]);
      const isValid = validate(value);

      if (isValid && (value || value === true || value === 0)) {
        const question = await hooks.onImplicitQuestion(q, value);

        implicitQuestions.push(question);
        implicitAnswers[name] = value;
      } else {
        const question = await hooks.onInteractiveQuestion(q);

        interactiveQuestions.push(question);
      }
    }

    const interactiveAnswers = await inquirer.prompt(interactiveQuestions);

    return {
      ...implicitAnswers,
      ...interactiveAnswers
    };
  }
};

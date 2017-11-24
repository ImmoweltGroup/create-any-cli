// @flow

import type {
  DecoratedTemplateArgsType,
  FilePatternListType,
  TemplateArgsType
} from './../types.js';

const path = require('path');
const dot = require('dot');
const lodash = require('lodash');
const {ora, createMsg} = require('./logger.js');
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
   * @param  {String}  templateDir The absolute path to the template dir to use.
   * @param  {String}  distDir     The absolute path where the processed template should be moved into.
   * @param  {Object}  args        The arguments for the template engine.
   * @return {Promise}             The Promise that resolves once the template got processed.
   */
  async processTemplateAndCreate(opts: {
    filePatterns: FilePatternListType,
    srcDir: string,
    distDir: string,
    args: TemplateArgsType,
    ignorePatterns?: FilePatternListType,
    templateSettings?: Object | void
  }): Promise<void> {
    const {
      distDir,
      srcDir,
      filePatterns,
      args,
      ignorePatterns = [],
      templateSettings = {}
    } = opts;

    //
    // Ensure that the directory exists and is empty.
    //
    await file.ensureDir(distDir);

    const existingDistFiles = await file.readdirAsync(distDir);

    if (existingDistFiles.length) {
      console.warn(
        `Target folder "${distDir}" is not empty, skipping any further tasks...`
      );
      return;
    }

    //
    // If the directory is empty, resolve all files based on the patterns and
    // process their dist paths and the contents.
    //
    const pathPatterns = filePatterns.map(pattern =>
      path.join(srcDir, pattern)
    );
    const files = await file.globAsync(pathPatterns, {
      nodir: true,
      symlinks: false,
      ignore: ignorePatterns
    });

    for (let filePath of files) {
      const relativeFilePath = this.template(
        filePath.replace(srcDir, ''),
        args,
        templateSettings
      );
      const trimmedRelativeFilePath = file.trimFilePath(relativeFilePath);
      const distFilePath = path.join(distDir, relativeFilePath);

      const fileSpinner = ora(
        createMsg('Reading file', trimmedRelativeFilePath)
      ).start();
      const contents = await file.readFileAsync(filePath, 'utf8');

      fileSpinner.text = createMsg('Processing file', trimmedRelativeFilePath);
      const data = this.template(contents, args, templateSettings);

      fileSpinner.text = createMsg('Writing file', trimmedRelativeFilePath);
      await file.writeFileAsync(distFilePath, data);

      fileSpinner.succeed();
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

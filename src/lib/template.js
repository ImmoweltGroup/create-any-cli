// @flow

const path = require('path');
const chalk = require('chalk');
const lodash = require('lodash');
const {ora} = require('./logger.js');
const file = require('./file.js');

type TemplateArgsType = {
  [string]: {
    raw: string,
    snakeCase: string,
    kebabCase: string,
    camelCase: string,
    lowerCase: string,
    startCase: string,
    upperCase: string
  }
};

module.exports = {
  /**
   * Creates an templates arg object to be used with your template engine.
   *
   * @param {Object} argsByKey The raw arguments by their keys.
   * @return {Object}          The input object transformed into an object with variant properties of the raw value.
   */
  createArgs(argsByKey: {[string]: string}): TemplateArgsType {
    const variants = [
      'snakeCase',
      'kebabCase',
      'camelCase',
      'lowerCase',
      'startCase',
      'upperCase'
    ];

    return Object.keys(argsByKey).reduce(
      (args: TemplateArgsType, argKey: string) => {
        const raw = argsByKey[argKey];
        const transformedArgs: Object = {
          raw
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
   * Removes starting slashes from filePaths
   *
   * @param  {String} filePath The filePath to trim.
   * @return {String}          The trimmed filePath.
   */
  trimFilePath(filePath: string) {
    return filePath.startsWith('/') ? filePath.replace('/', '') : filePath;
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
    files: string,
    distDir: string,
    args: Object
  }) {
    const createLogOutPut = (filePath: string, task: string) => {
      return `${chalk.bold.white(task + ' file:')} ${chalk.dim(
        this.trimFilePath(filePath)
      )}`;
    };
    const {distDir, args} = opts;
    const nestedFilePaths = await Promise.all(
      files.map(filePatternPath =>
        file.globAsync(filePatternPath, {nodir: true, symlinks: false})
      )
    );
    const files = [].concat.apply([], nestedFilePaths);

    await file.ensureDir(distDir);

    for (let filePath of files) {
      const relativeFilePath = lodash.template(
        filePath.replace(templateDir, '')
      )({args});
      const distFilePath = path.join(distDir, relativeFilePath);

      const fileSpinner = ora(
        createLogOutPut(relativeFilePath, 'Reading')
      ).start();
      const contents = await file.readFileAsync(filePath, 'utf8');

      fileSpinner.text = createLogOutPut(relativeFilePath, 'Processing');
      const data = lodash.template(contents)({args});

      fileSpinner.text = createLogOutPut(relativeFilePath, 'Writing');
      await file.writeFileAsync(distFilePath, data);

      fileSpinner.succeed();
    }
  },

  async resolveTemplates(
    cwd: string,
    patterns: Array<string>,
    fileName?: string = 'create-config.js'
  ) {
    const nestedFolderPaths = await Promise.all(
      patterns.map(pattern => file.globAsync(path.join(cwd, pattern)))
    );
    const folderPaths = [].concat.apply(
      [path.join(cwd, 'node_modules')],
      nestedFolderPaths
    );
    const nestedConfigPaths = await Promise.all(
      folderPaths.map(async folderPath => {
        return file.globAsync(path.join(folderPath, '**', fileName));
      })
    );
    const configPaths = [].concat.apply([], nestedConfigPaths);
    const templatesById = {};

    configPaths.forEach(configPath => {
      const config = require(configPath);

      // ToDo: Enhance config validation.
      if (typeof config.id !== 'string') {
        return;
      }

      //
      // In case two templates with the same ID will be resolved,
      // a warning will be printed and the latter one will be ignored.
      //
      if (templatesById[config.id]) {
        return;
      }

      templatesById[config.id] = config;
    });

    return templatesById;
  }
};

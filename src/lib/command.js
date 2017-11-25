// @flow

import type {CliConfigType, TemplateConfigsByIdType} from './../types.js';

const path = require('path');
const lodash = require('lodash');
const file = require('./file.js');
const template = require('./template.js');
const {ora, createMsg} = require('./logger.js');

class Command {
  cli: {
    cwd: string,
    help: string,
    input: Array<string>,
    flags: {
      [string]: mixed
    },
    config: CliConfigType,
    resolveConfig: Object
  } = {
    cwd: '',
    input: [],
    flags: {},
    config: {
      templates: []
    },
    resolveConfig: {
      rawConfigFileName: '.createrc',
      packageJsonProperty: 'create-any-cli',
      defaults: {
        templates: []
      }
    },
    help: `Effortlessly create new files or modules based upon templates in your application.

Usage:
  $ create [template-id] <...options>

Options:
  --help, -h  Print this help

Examples:
  # Interactively choose from all available templates
  $ create

  # Use a specific template
  $ create my-template

  # Use a specific template and print the help
  $ create my-template --help

  # Use a specific template, provide answers and skip interactive prompts
  $ create my-template --name="Foo Bar"`
  };
  templates = {
    defaults: {
      async resolveFiles() {
        return ['*/**'];
      },
      async createTemplateArgs(answers: any) {
        return template.createDecoratedTemplateArgs(answers);
      },
      async resolveDestinationFolder() {
        return process.cwd();
      }
    }
  };
  spinner = ora();

  constructor(args: {input: Array<string>, flags: Object}) {
    this.cli.input = args.input;
    this.cli.flags = args.flags;
  }

  /**
   * Indicates if the user requested help to be printed to the console.
   *
   * @return {Boolean} The boolean indicating if the user requested help to be printed to the console.
   */
  shouldResolveAndPrintHelp() {
    const {h, help} = this.cli.flags;

    return h === true || help === true;
  }

  /**
   * Resolves the requested template ID
   *
   * - if none was given it will print the regular CLI help usage.
   * - if one was given it will print a template help usage based on the configuration.
   *
   * @return {Promise} The Promise that resolves once the help was printed to the users console.
   */
  async resolveAndPrintHelp() {
    const templateId = await this.getRequestedTemplateId();

    if (templateId.length === 0) {
      return console.log(this.cli.help);
    }

    await this.bootstrap();

    const templatesById = await this.getTemplatesById();
    const template = templatesById[templateId];

    if (!template) {
      return this.log(
        'fail',
        `No template found for id "${
          templateId
        }". Available template ID's are ${Object.keys(templatesById)
          .map(str => `"${str}"`)
          .join(' ')}`
      );
    }

    const {
      description = `No description for template "${templateId}" exported.`,
      resolveQuestions = () => []
    } = template.config;
    const questions = await resolveQuestions();
    const padding =
      questions.reduce((padding, question) => {
        const questionPadding = question.name.length;
        return questionPadding > padding ? questionPadding : padding;
      }, 0) + 1;

    return console.log(`${description}

Usage:
  $ create ${templateId} <...options>

Options:
${questions
      .map(question => {
        const {name, message} = question;

        return `  --${lodash.padEnd(name, padding)} ${message}`;
      })
      .join('\n')}

Examples:
  $ create ${templateId} <...options>`);
  }

  /**
   * Bootstraps the CLI, needs to be invoked before accessing any properties of this class.
   *
   * @return {Promise} The Promise that resolves once everything is corretly setup.
   */
  async bootstrap() {
    await Promise.all([this.resolveCwd(), this.resolveConfig()]);
  }

  /**
   * Logs a message to the users console.
   *
   * @param  {String}       severity The severity of the message to log.
   * @param  {Array<mixed>} args     The arguments to log.
   * @return {void}
   */
  log(
    severity: 'start' | 'succeed' | 'fail' | 'warn' | 'info',
    ...args: Array<string>
  ): void {
    this.spinner[severity](createMsg(...args));
  }

  /**
   * Suspends the logging of the spinner.
   *
   * @return {void}
   */
  suspendLogging() {
    this.spinner.stopAndPersist();
  }

  /**
   * Resolves the working directory of the users configuration.
   *
   * @return {Promise} The Promise that resolves once the cwd got resolved.
   */
  async resolveCwd() {
    const cwd =
      (await file.findConfigUp.resolveConfigPath(this.cli.resolveConfig)) ||
      process.cwd();

    this.cli.cwd = cwd.replace('package.json', '').replace('.createrc', '');
  }

  /**
   * Resolves the users configuration from disk.
   *
   * @return {Promise} The Promise that resolves once the configuration was resolved.
   */
  async resolveConfig() {
    this.cli.config = await file.findConfigUp(this.cli.resolveConfig);
  }

  async getRequestedTemplateId() {
    return this.cli.input.join(' ').toLowerCase();
  }

  /**
   * Resolves all `create-config.js` from the processes cwd , validates the exports and
   * returns a hash map where the key is the ID of the template and the value the exports.
   *
   * @return {Promise} The Promise that resolves once all configurations where loaded.
   */
  async getTemplatesById(): Promise<TemplateConfigsByIdType> {
    const fileName = 'create-config.js';
    const {config, cwd} = this.cli;
    const pathPatterns = config.templates.map((pattern: string) =>
      path.join(cwd, pattern, '**', fileName)
    );
    const configPaths = await file.globAsync(pathPatterns);

    return configPaths.reduce(
      (templatesById: TemplateConfigsByIdType, configPath) => {
        const cwd = configPath.replace(fileName, '');
        const config = file.require(configPath);

        // ToDo: Enhance config validation.
        if (typeof config !== 'object') {
          console.warn(
            `Unknown config type "${typeof config}" at "${
              configPath
            }" found, please export an object.`
          );

          return templatesById;
        }

        if (typeof config.id !== 'string') {
          console.warn(
            `No ID in config exports of "${
              configPath
            }" found, please export an object containing an ID of type string.`
          );

          return templatesById;
        }

        //
        // In case two templates with the same ID will be resolved the latter one will be ignored.
        //
        if (templatesById[config.id]) {
          console.warn(
            `Two templates with an identical ID in config exports of "${
              cwd
            }" and "${
              templatesById[config.id].cwd
            }" found, skipping the first match in favor of the second.`
          );

          return templatesById;
        }

        templatesById[config.id] = {
          cwd: configPath.replace(fileName, ''),
          config
        };
        [
          'resolveQuestions',
          'resolveFiles',
          'createTemplateArgs',
          'resolveDestinationFolder'
        ].forEach(fnName => {
          templatesById[config.id].config[fnName] = this.wrapTemplateFunction(
            config.id,
            fnName,
            config[fnName]
          );
        });

        return templatesById;
      },
      {}
    );
  }

  wrapTemplateFunction(templateId: string, fnName: string, fn: Function) {
    if (!fn) {
      return this.templates.defaults[fnName];
    }

    return async (...args: Array<mixed>) => {
      let result;

      try {
        result = await fn(...args);
      } catch (e) {
        result = e;
      }

      if (result instanceof Error) {
        this.log('fail', `Error returned from ${templateId}`, `${fnName}()`);
        this.log('fail', result);
        process.exit(1);
      }

      return result;
    };
  }
}

module.exports = Command;

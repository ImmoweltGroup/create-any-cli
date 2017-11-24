// @flow

import type {CliConfigType, TemplateConfigsByIdType} from './../types.js';

const path = require('path');
const file = require('./file.js');
const template = require('./template.js');
const {ora, createMsg} = require('./logger.js');

class Command {
  cwd: string = '';
  spinner = ora();
  config: CliConfigType;
  configOpts = {
    rawConfigFileName: '.createrc',
    packageJsonProperty: 'create-any-cli',
    defaults: {
      templates: []
    }
  };

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
   * Resolves the working directory of the users configuration.
   *
   * @return {Promise} The Promise that resolves once the cwd got resolved.
   */
  async resolveCwd() {
    const cwd =
      (await file.findConfigUp.resolveConfigPath(this.configOpts)) ||
      process.cwd();

    this.cwd = cwd.replace('package.json', '').replace('.createrc', '');
  }

  /**
   * Resolves the users configuration from disk.
   *
   * @return {Promise} The Promise that resolves once the configuration was resolved.
   */
  async resolveConfig() {
    this.config = await file.findConfigUp(this.configOpts);
  }

  /**
   * Resolves all `create-config.js` from the processes cwd , validates the exports and
   * returns a hash map where the key is the ID of the template and the value the exports.
   *
   * @return {Promise} The Promise that resolves once all configurations where loaded.
   */
  async getTemplatesById(): Promise<TemplateConfigsByIdType> {
    const fileName = 'create-config.js';
    const {config, cwd} = this;
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
          config: Object.assign(
            {
              async resolveFiles(answers) {
                return ['*/**'];
              },
              async createTemplateArgs(answers) {
                return template.createDecoratedTemplateArgs(answers);
              },
              async resolveDestinationFolder() {
                return process.cwd();
              }
            },
            config
          )
        };

        return templatesById;
      },
      {}
    );
  }
}

module.exports = Command;

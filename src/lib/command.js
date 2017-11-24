// @flow

import type {CliConfigType, TemplateConfigsByIdType} from './../types.js';

const path = require('path');
const file = require('./file.js');
const template = require('./template.js');
const {ora, createMsg} = require('./logger.js');

const configOpts = {
  rawConfigFileName: '.createrc',
  packageJsonProperty: 'create-any-cli',
  defaults: {
    templates: []
  }
};

class Command {
  cwd: string = '';
  spinner = ora();
  config: CliConfigType;

  async bootstrap() {
    await Promise.all([this.resolveCwd(), this.resolveConfig()]);
  }

  log(
    severity: 'start' | 'succeed' | 'fail' | 'warn' | 'info',
    ...args: Array<string>
  ): void {
    this.spinner[severity](createMsg(...args));
  }

  async resolveCwd() {
    const cwd =
      (await file.findConfigUp.resolveConfigPath(configOpts)) || process.cwd();

    this.cwd = cwd.replace('package.json', '').replace('.createrc', '');
  }

  async resolveConfig() {
    this.config = await file.findConfigUp(configOpts);
  }

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

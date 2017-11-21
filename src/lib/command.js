// @flow

import type {CliConfigType} from './../types.js';

const {findConfigUp} = require('./file.js');
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

  async exec() {
    await Promise.all([this.resolveCwd(), this.resolveConfig()]);
  }

  log(
    severity: 'start' | 'succeed' | 'fail' | 'warn' | 'info',
    ...args: Array<string>
  ): void {
    this.spinner[severity](createMsg(...args));
  }

  async resolveConfig() {
    this.config = await findConfigUp(configOpts);
  }

  getConfig() {
    return this.config;
  }

  async resolveCwd(): Promise<void> {
    const configCwd =
      (await findConfigUp.resolveConfigPath(configOpts)) || process.cwd();

    this.cwd = configCwd.replace('/package.json', '').replace('/.createrc', '');
  }

  getCwd() {
    return this.cwd;
  }
}

module.exports = Command;

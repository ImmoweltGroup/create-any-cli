// @flow

const ora = require('ora');
const chalk = require('chalk');

module.exports = {
  ora,
  createMsg(a: string, b?: string, c?: string): string {
    return [
      chalk.bold.white(`create-any-cli » ${a}`),
      b ? chalk.bold.dim(`» ${b}`) : null,
      c ? chalk.bold.white(`» ${c}`) : null
    ]
      .filter(Boolean)
      .join(' ');
  },
  fatal(...args: Array<any>): void {
    console.error(...args);

    process.exit(1);
  }
};

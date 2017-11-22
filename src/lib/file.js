// @flow

const fs = require('fs');
const fsExtra = require('fs-extra');
const findConfigUp = require('find-config-up');
const {promisify} = require('util');
const glob = require('glob');

const _utils = {
  globAsync: promisify(glob)
};

module.exports = {
  _utils: _utils,
  globAsync: async (
    patterns: Array<string> | string,
    ...args: Array<mixed>
  ) => {
    if (patterns instanceof Array) {
      const nestedPaths = await Promise.all(
        patterns.map(pattern => _utils.globAsync(pattern, ...args))
      );

      return [].concat.apply([], nestedPaths);
    }

    return _utils.globAsync(patterns, ...args);
  },
  readFileAsync: promisify(fs.readFile),
  readdirAsync: promisify(fs.readdir),
  readJsonAsync: fsExtra.readJson,
  writeFileAsync: fsExtra.outputFile,
  ensureDir: fsExtra.ensureDir,
  require: require,
  findConfigUp
};

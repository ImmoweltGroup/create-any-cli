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

  /**
   * Executes the glob util, enhanced with a multi-glob functionality.
   * @param  {Array<string> | string}  patterns The list or single pattern to glob.
   * @param  {Array<mixed>}            args     Additional arguments to propagate to the glob util.
   * @return {Promise}                          The Promise that resolves with a flattened array of paths that where found for the input.
   */
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

  /**
   * Removes starting slashes from filePaths
   *
   * @param  {String} filePath The filePath to trim.
   * @return {String}          The trimmed filePath.
   */
  trimFilePath(filePath: string) {
    return filePath.startsWith('/') ? filePath.replace('/', '') : filePath;
  },
  readFileAsync: promisify(fs.readFile),
  readdirAsync: promisify(fs.readdir),
  readJsonAsync: fsExtra.readJson,
  writeFileAsync: fsExtra.outputFile,
  ensureDir: fsExtra.ensureDir,
  require: require,
  findConfigUp
};

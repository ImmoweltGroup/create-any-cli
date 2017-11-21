// @flow

const fs = require('fs');
const fsExtra = require('fs-extra');
const findConfigUp = require('find-config-up');
const {promisify} = require('util');
const glob = require('glob');

module.exports = {
  globAsync: promisify(glob),
  readFileAsync: promisify(fs.readFile),
  readdirAsync: promisify(fs.readdir),
  readJsonAsync: fsExtra.readJson,
  writeFileAsync: fsExtra.outputFile,
  ensureDir: fsExtra.ensureDir,
  require: require,
  findConfigUp
};

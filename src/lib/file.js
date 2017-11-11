// @flow

const fs = require('fs');
const fsExtra = require('fs-extra');
const {promisify} = require('util');
const glob = require('glob');

module.exports = {
  globAsync: promisify(glob),
  readFileAsync: promisify(fs.readFile),
  readJsonAsync: fsExtra.readJson,
  writeFileAsync: fsExtra.outputFile,
  ensureDir: fsExtra.ensureDir
};

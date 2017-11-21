// @flow

const defaultCommand = require('./default.js');

describe('defaultCommand()', () => {
  it('should be a function', () => {
    expect(typeof defaultCommand).toBe('function');
  });
});

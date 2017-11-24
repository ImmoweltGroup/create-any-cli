// @flow

const defaultCommand = require('./default.js');

describe('defaultCommand()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof defaultCommand).toBe('function');
  });
});

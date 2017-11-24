// @flow

const DefaultCommand = require('./default.js');

describe('DefaultCommand', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof DefaultCommand).toBe('function');
  });
});

describe('new DefaultCommand().exec()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new DefaultCommand();
    expect(typeof instance.exec).toBe('function');
  });
});

describe('new DefaultCommand().resolveAndPromptForTemplate()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new DefaultCommand();
    expect(typeof instance.resolveAndPromptForTemplate).toBe('function');
  });
});

describe('new DefaultCommand().resolveAndPromptForTemplate()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new DefaultCommand();
    expect(typeof instance.resolveAndPromptForTemplate).toBe('function');
  });
});

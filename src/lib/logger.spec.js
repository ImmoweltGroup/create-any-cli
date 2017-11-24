// @flow

const logger = require('./logger.js');

describe('logger.ora()', () => {
  it('should be a function', () => {
    expect(typeof logger.ora).toBe('function');
  });
});

describe('logger.fatal()', () => {
  let exit;
  let error;

  beforeEach(() => {
    exit = jest.spyOn(process, 'exit').mockImplementation(jest.fn());
    error = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof logger.fatal).toBe('function');
  });

  it('should log the error and exit the process with code "1"', () => {
    logger.fatal('foo');

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('foo');
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
  });
});

describe('logger.createMsg()', () => {
  it('should be a function', () => {
    expect(typeof logger.createMsg).toBe('function');
  });

  it('should return a string that can be logged depending on how my arguments where given', () => {
    expect(logger.createMsg('foo')).toContain('foo');
    expect(logger.createMsg('foo', 'bar')).toContain('foo');
    expect(logger.createMsg('foo', 'bar')).toContain('bar');
    expect(logger.createMsg('foo', 'bar', 'baz')).toContain('foo');
    expect(logger.createMsg('foo', 'bar', 'baz')).toContain('bar');
    expect(logger.createMsg('foo', 'bar', 'baz')).toContain('baz');
  });
});

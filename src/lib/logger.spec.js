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
    exit.mockRestore();
  });

  it('should be a function', () => {
    expect(typeof logger.fatal).toBe('function');
  });

  it('should log the error and exit the process with code "1"', () => {
    logger.fatal('foo');

    expect(error.mock.calls.length).toBe(1);
    expect(error.mock.calls[0][0]).toBe('foo');
    expect(exit.mock.calls.length).toBe(1);
    expect(exit.mock.calls[0][0]).toBe(1);
  });
});

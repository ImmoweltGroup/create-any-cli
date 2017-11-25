// @flow

const logger = require('./logger.js');

describe('logger.ora()', () => {
  it('should be a function', () => {
    expect(typeof logger.ora).toBe('function');
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

// @flow

const file = require('./file.js');

describe('file.globAsync()', () => {
  it('should be a function', () => {
    expect(typeof file.globAsync).toBe('function');
  });
});

describe('file.readFileAsync()', () => {
  it('should be a function', () => {
    expect(typeof file.readFileAsync).toBe('function');
  });
});

describe('file.writeFileAsync()', () => {
  it('should be a function', () => {
    expect(typeof file.writeFileAsync).toBe('function');
  });
});

describe('file.ensureDir()', () => {
  it('should be a function', () => {
    expect(typeof file.ensureDir).toBe('function');
  });
});

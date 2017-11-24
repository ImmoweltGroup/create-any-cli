// @flow

const api = require('./api.js');

describe('api.createDecoratedTemplateArgs()', () => {
  it('should be a function', () => {
    expect(typeof api.createDecoratedTemplateArgs).toBe('function');
  });
});

describe('api.processTemplateAndCreate()', () => {
  it('should be a function', () => {
    expect(typeof api.processTemplateAndCreate).toBe('function');
  });
});

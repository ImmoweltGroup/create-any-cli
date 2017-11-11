const oraInstance = {
  start: jest.fn(() => oraInstance),
  succeed: jest.fn(() => oraInstance),
  fail: jest.fn(() => oraInstance),
  warn: jest.fn(() => oraInstance),
  info: jest.fn(() => oraInstance),
  text: '',
  color: ''
};

module.exports = {
  ora: jest.fn(() => oraInstance),
  fatal: jest.fn()
};

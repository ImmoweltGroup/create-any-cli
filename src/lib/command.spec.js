// @flow

jest.mock('./file.js');
jest.mock('./logger.js');

const logger: any = require('./logger.js');
const file: any = require('./file.js');
const Command = require('./command.js');

describe('Command()', () => {
  it('should be a function', () => {
    expect(typeof Command).toBe('function');
  });
});

describe('new Command().exec()', () => {
  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.exec).toBe('function');
  });

  it('should execute the "resolveCwd" and "resolveConfig" methods', async () => {
    const instance = new Command();
    const resolveCwd = jest
      .spyOn(instance, 'resolveCwd')
      .mockImplementation(jest.fn());
    const resolveConfig = jest
      .spyOn(instance, 'resolveConfig')
      .mockImplementation(jest.fn());

    await instance.exec();

    expect(resolveCwd.mock.calls.length).toBe(1);
    expect(resolveConfig.mock.calls.length).toBe(1);

    resolveCwd.mockRestore();
    resolveConfig.mockRestore();
  });
});

describe('new Command().log()', () => {
  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.log).toBe('function');
  });

  it('should execute the given ora method with the provided args', async () => {
    const instance = new Command();
    const start = jest.fn();
    instance.spinner = {start};
    logger.createMsg.mockReturnValue('foo');

    await instance.log('start', 'foo');

    expect(start.mock.calls.length).toBe(1);
    expect(logger.createMsg.mock.calls.length).toBe(1);
  });
});

describe('new Command().resolveConfig()', () => {
  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.resolveConfig).toBe('function');
  });

  it('should call the findConfigUp() util', async () => {
    const instance = new Command();

    instance.resolveConfig();

    expect(file.findConfigUp.mock.calls.length).toBe(1);
  });
});

describe('new Command().getConfig()', () => {
  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.getConfig).toBe('function');
  });

  it('should return the instances config property', () => {
    const instance = new Command();

    expect(instance.getConfig()).toBe(instance.config);
  });
});

describe('new Command().resolveCwd()', () => {
  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.resolveCwd).toBe('function');
  });

  it('should call the findConfigUp.resolveConfigPath() util', async () => {
    const instance = new Command();

    instance.resolveCwd();

    expect(file.findConfigUp.resolveConfigPath.mock.calls.length).toBe(1);
  });
});

describe('new Command().getCwd()', () => {
  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.getCwd).toBe('function');
  });

  it('should return the instances config property', () => {
    const instance = new Command();

    expect(instance.getCwd()).toBe(instance.cwd);
  });
});

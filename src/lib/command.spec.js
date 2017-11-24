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

describe('new Command().bootstrap()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.bootstrap).toBe('function');
  });

  it('should execute the "resolveCwd" and "resolveConfig" methods', async () => {
    const instance = new Command();
    const resolveCwd = jest
      .spyOn(instance, 'resolveCwd')
      .mockImplementation(jest.fn());
    const resolveConfig = jest
      .spyOn(instance, 'resolveConfig')
      .mockImplementation(jest.fn());

    await instance.bootstrap();

    expect(resolveCwd).toHaveBeenCalledTimes(1);
    expect(resolveConfig).toHaveBeenCalledTimes(1);
  });
});

describe('new Command().log()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

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

    expect(start).toHaveBeenCalledTimes(1);
    expect(logger.createMsg).toHaveBeenCalledTimes(1);
  });
});

describe('new Command().resolveConfig()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.resolveConfig).toBe('function');
  });

  it('should call the file.findConfigUp() util and attach the return value to the "config" property of the class', async () => {
    file.findConfigUp.mockReturnValueOnce('foo');
    const instance = new Command();

    await instance.resolveConfig();

    expect(file.findConfigUp).toHaveBeenCalledTimes(1);
    expect(instance.config).toBe('foo');
  });
});

describe('new Command().resolveCwd()', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.resolveCwd).toBe('function');
  });

  it('should call the file.findConfigUp.resolveConfigPath() util and attach the return value to the "cwd" property of the class', async () => {
    file.findConfigUp.resolveConfigPath.mockReturnValueOnce(
      '/foo/bar/package.json'
    );
    const instance = new Command();

    await instance.resolveCwd();

    expect(file.findConfigUp.resolveConfigPath).toHaveBeenCalledTimes(1);
    expect(instance.cwd).toBe('/foo/bar/');
  });
});

describe('new Command().getTemplatesById()', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new Command();

    expect(typeof instance.getTemplatesById).toBe('function');
  });

  it('should resolve all template configs by their id', async () => {
    const instance = new Command();
    const fooConfig = {
      id: 'foo',
      resolveFiles: jest.fn(),
      createTemplateArgs: jest.fn(),
      resolveDestinationFolder: jest.fn()
    };

    instance.cwd = '/foo';
    instance.config = {
      templates: ['*']
    };
    file.require
      .mockReturnValueOnce()
      .mockReturnValueOnce({})
      .mockReturnValue(fooConfig);
    file.globAsync.mockReturnValueOnce([
      '/foo/some-template/create-config.js',
      '/foo/another-template/create-config.js',
      '/foo/yet-another-template/create-config.js',
      '/foo/duplicate-template/create-config.js'
    ]);

    const configs = await instance.getTemplatesById();

    expect(typeof configs).toBe('object');
    expect(typeof configs.foo).toBe('object');
    expect(configs.foo.cwd).toBe('/foo/yet-another-template/');
    expect(configs.foo.config).toEqual(fooConfig);
  });
});

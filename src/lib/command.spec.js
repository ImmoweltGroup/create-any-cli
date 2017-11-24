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
  let instance;

  beforeEach(() => {
    instance = new Command();
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.bootstrap).toBe('function');
  });

  it('should execute the "resolveCwd" and "resolveConfig" methods', async () => {
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
  let instance;

  beforeEach(() => {
    instance = new Command();
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.log).toBe('function');
  });

  it('should execute the given ora method with the provided args', async () => {
    const start = jest.fn();
    instance.spinner = {start};
    logger.createMsg.mockReturnValue('foo');

    await instance.log('start', 'foo');

    expect(start).toHaveBeenCalledTimes(1);
    expect(logger.createMsg).toHaveBeenCalledTimes(1);
  });
});

describe('new Command().resolveConfig()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command();
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.resolveConfig).toBe('function');
  });

  it('should call the file.findConfigUp() util and attach the return value to the "config" property of the class', async () => {
    file.findConfigUp.mockReturnValueOnce('foo');

    await instance.resolveConfig();

    expect(file.findConfigUp).toHaveBeenCalledTimes(1);
    expect(instance.config).toBe('foo');
  });
});

describe('new Command().resolveCwd()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command();
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.resolveCwd).toBe('function');
  });

  it('should call the file.findConfigUp.resolveConfigPath() util and attach the return value to the "cwd" property of the class', async () => {
    file.findConfigUp.resolveConfigPath.mockReturnValueOnce(
      '/foo/bar/package.json'
    );

    await instance.resolveCwd();

    expect(file.findConfigUp.resolveConfigPath).toHaveBeenCalledTimes(1);
    expect(instance.cwd).toBe('/foo/bar/');
  });
});

describe('new Command().getTemplatesById()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command();
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.getTemplatesById).toBe('function');
  });

  it('should resolve all template configs by their id', async () => {
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

describe('new Command().wrapTemplateFunction()', () => {
  let instance;
  let exit;
  let log;

  beforeEach(() => {
    instance = new Command();
    exit = jest.spyOn(process, 'exit').mockImplementation(jest.fn());
    log = jest.spyOn(instance, 'log').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.wrapTemplateFunction).toBe('function');
  });

  it('should fallback on returning a default if the given function is not defined', async () => {
    // $FlowFixMe: Ignore errors since we test an edge case.
    const fn = await instance.wrapTemplateFunction(
      'my-template',
      'resolveDestinationFolder'
    );

    expect(fn).toEqual(
      instance.defaults.template.config.resolveDestinationFolder
    );
  });

  it('should wrap the function and propagate all arguments to it', async () => {
    const wrappedFn = jest.fn();
    const fn = await instance.wrapTemplateFunction(
      'my-template',
      'resolveDestinationFolder',
      wrappedFn
    );

    await fn('foo', 'bar');

    expect(wrappedFn).toHaveBeenCalledWith('foo', 'bar');
  });

  it('should wrap the function with a pretty error log if it was defined', async () => {
    const wrappedFn = jest.fn(() => new Error('Something bad happened'));
    const fn = await instance.wrapTemplateFunction(
      'my-template',
      'resolveDestinationFolder',
      wrappedFn
    );

    await fn('foo', 'bar');

    expect(log).toHaveBeenCalledWith(
      'fail',
      'Error returned from my-template',
      'resolveDestinationFolder()'
    );
    expect(exit).toHaveBeenCalledWith(1);
  });
});

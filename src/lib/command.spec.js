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

describe('new Command().shouldResolveAndPrintHelp()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command({input: [], flags: {}});
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.shouldResolveAndPrintHelp).toBe('function');
  });

  it('should return a boolean indicating if either the "-h" or "--help" flag was passed', async () => {
    expect(instance.shouldResolveAndPrintHelp()).toBe(false);

    instance.cli.flags = {h: true};
    expect(instance.shouldResolveAndPrintHelp()).toBe(true);

    instance.cli.flags = {help: true};
    expect(instance.shouldResolveAndPrintHelp()).toBe(true);
  });
});

describe('new Command().resolveAndPrintHelp()', () => {
  let instance;
  let getRequestedTemplateId;
  let getTemplatesById;
  let log;

  beforeEach(() => {
    instance = new Command({input: [], flags: {}});
    log = jest.spyOn(console, 'log').mockImplementation(jest.fn());
    getRequestedTemplateId = jest
      .spyOn(instance, 'getRequestedTemplateId')
      .mockImplementation(jest.fn(() => ''));
    getTemplatesById = jest
      .spyOn(instance, 'getTemplatesById')
      .mockImplementation(jest.fn(() => ({})));
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.resolveAndPrintHelp).toBe('function');
  });

  it('should log the regular CLI help if no template id was given.', async () => {
    await instance.resolveAndPrintHelp();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]).toMatchSnapshot();
  });

  it('should resolve the requested template id and log a failure if it is invalid.', async () => {
    log = jest.spyOn(instance, 'log').mockImplementation(jest.fn());
    getRequestedTemplateId.mockReturnValueOnce('foo-template');
    getTemplatesById.mockReturnValueOnce({'bar-template': {}});

    await instance.resolveAndPrintHelp();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      'fail',
      `No template found for id "foo-template". Available template ID's are "bar-template"`
    );
  });

  it('should print a custom template help if the requested template id is valid.', async () => {
    getRequestedTemplateId.mockReturnValueOnce('foo-template');
    getTemplatesById.mockReturnValueOnce({
      'foo-template': {
        config: {
          description: 'My template description.',
          resolveQuestions: () => [
            {
              name: 'some-option',
              message: 'Some random option'
            },
            {
              name: 'another-option',
              message: 'Some other random option'
            }
          ]
        }
      }
    });

    await instance.resolveAndPrintHelp();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]).toMatchSnapshot();
  });
});

describe('new Command().bootstrap()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command({input: [], flags: {}});
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
    instance = new Command({input: [], flags: {}});
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
    instance = new Command({input: [], flags: {}});
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
    expect(instance.cli.config).toBe('foo');
  });
});

describe('new Command().resolveCwd()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command({input: [], flags: {}});
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
    expect(instance.cli.cwd).toBe('/foo/bar/');
  });
});

describe('new Command().getTemplatesById()', () => {
  let instance;

  beforeEach(() => {
    instance = new Command({input: [], flags: {}});
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

    instance.cli.cwd = '/foo';
    instance.cli.config = {
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
    instance = new Command({input: [], flags: {}});
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

    expect(fn).toEqual(instance.templates.defaults.resolveDestinationFolder);
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

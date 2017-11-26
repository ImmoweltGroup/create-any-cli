// @flow

jest.mock('./../api.js');
jest.mock('./../lib/logger.js');

const inquirer = require('inquirer');
const DefaultCommand = require('./default.js');
const api: any = require('./../api.js');

describe('DefaultCommand', () => {
  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof DefaultCommand).toBe('function');
  });
});

describe('new DefaultCommand().exec()', () => {
  let instance;
  let bootstrap;
  let resolveTemplateConfiguration;
  let resolveTemplateAnswers;
  let fail;
  let template;
  let answers;

  beforeEach(() => {
    instance = new DefaultCommand({input: [], flags: {}});
    template = {
      cwd: '/foo/bar',
      config: {
        id: 'someTemplate',
        resolveFiles: jest.fn(() => ['some/file/*/pattern']),
        createTemplateArgs: jest.fn(answers => answers),
        resolveDestinationFolder: jest.fn(() => '/foo/baz')
      }
    };
    answers = {
      someAnswer: true
    };
    fail = jest.spyOn(instance, 'fail').mockImplementation(jest.fn());
    bootstrap = jest.spyOn(instance, 'bootstrap').mockImplementation(jest.fn());
    resolveTemplateConfiguration = jest
      .spyOn(instance, 'resolveTemplateConfiguration')
      .mockImplementation(jest.fn(() => template));
    resolveTemplateAnswers = jest
      .spyOn(instance, 'resolveTemplateAnswers')
      .mockImplementation(jest.fn(() => answers));
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.exec).toBe('function');
  });

  it('should immediately invoke the "bootstrap" method', async () => {
    await instance.exec();

    expect(bootstrap).toHaveBeenCalledTimes(1);
  });

  it('should call the "fail" method if no template was returned from the "resolveTemplateConfiguration" method', async () => {
    resolveTemplateConfiguration.mockReturnValueOnce();

    await instance.exec();

    expect(resolveTemplateConfiguration).toHaveBeenCalledTimes(1);
    expect(fail).toHaveBeenCalledTimes(1);
  });

  it('should call resolve the template answers and start the template workflow', async () => {
    await instance.exec();

    expect(resolveTemplateAnswers).toHaveBeenCalledTimes(1);
    expect(resolveTemplateAnswers).toHaveBeenCalledWith(template);

    expect(template.config.resolveFiles).toHaveBeenCalledTimes(1);
    expect(template.config.resolveFiles).toHaveBeenCalledWith(
      answers,
      instance.cli.flags
    );

    expect(template.config.createTemplateArgs).toHaveBeenCalledTimes(1);
    expect(template.config.createTemplateArgs).toHaveBeenCalledWith(
      answers,
      instance.cli.flags
    );

    expect(template.config.resolveDestinationFolder).toHaveBeenCalledTimes(1);
    expect(template.config.resolveDestinationFolder).toHaveBeenCalledWith(
      answers,
      answers,
      instance.cli.flags
    );

    expect(api.processTemplateAndCreate).toHaveBeenCalledTimes(1);
    expect(api.processTemplateAndCreate.mock.calls[0]).toMatchSnapshot();
  });
});

describe('new DefaultCommand().resolveTemplateConfiguration()', () => {
  let instance;
  let getTemplatesById;
  let prompt;

  beforeEach(() => {
    instance = new DefaultCommand({input: [], flags: {}});
    prompt = jest
      .spyOn(inquirer, 'prompt')
      .mockImplementation(jest.fn(() => ({})));
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
    expect(typeof instance.resolveTemplateConfiguration).toBe('function');
  });

  it('should execute the "getTemplatesById" method and return nothing', async () => {
    const result = await instance.resolveTemplateConfiguration();

    expect(getTemplatesById).toHaveBeenCalledTimes(1);
    expect(result).not.toBeDefined();
  });

  it('should join the processes arguments and try to resolve a matching template', async () => {
    const fooTemplate = {};

    getTemplatesById.mockReturnValueOnce({
      foo: fooTemplate
    });
    instance.cli.input = ['foo'];

    const result = await instance.resolveTemplateConfiguration();

    expect(result).toBe(fooTemplate);
  });

  it('should create an interactive prompt if no implicit template was specified via the processes arguments', async () => {
    const fooTemplate = {foo: true};
    const barTemplate = {bar: true};

    getTemplatesById.mockReturnValueOnce({
      foo: fooTemplate,
      bar: barTemplate
    });
    prompt.mockReturnValueOnce({
      templateId: 'bar'
    });

    const result = await instance.resolveTemplateConfiguration();

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(result).toBe(barTemplate);
  });
});

describe('new DefaultCommand().resolveTemplateAnswers()', () => {
  let instance;
  let groupQuestionsByType;
  let prompt;

  beforeEach(() => {
    instance = new DefaultCommand({input: [], flags: {}});
    prompt = jest.spyOn(inquirer, 'prompt').mockImplementation(jest.fn());
    groupQuestionsByType = jest
      .spyOn(instance, 'groupQuestionsByType')
      .mockImplementation(
        jest.fn(() => ({
          interactiveQuestions: [],
          implicitAnswers: {},
          implicitQuestions: []
        }))
      );
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof instance.resolveTemplateAnswers).toBe('function');
  });

  it('should return an empty object if no resolveQuestions function was provided in the template', async () => {
    const template = {
      cwd: '/foo',
      config: {
        id: 'foo-template',
        description: 'foo',
        resolveQuestions: jest.fn(() => []),
        resolveFiles: jest.fn(),
        createTemplateArgs: jest.fn(),
        resolveDestinationFolder: jest.fn()
      }
    };
    const answers = await instance.resolveTemplateAnswers(template);

    expect(answers).toEqual({});
  });

  it('should resolve the templates questions by invoking the resolveQuestions function and propagate the resolve questions to the "groupQuestionsByType" method', async () => {
    const resolvedQuestions = [];
    const resolveQuestions = jest.fn(() => resolvedQuestions);
    const template = {
      cwd: '/foo',
      config: {
        id: 'foo-template',
        description: 'foo',
        resolveQuestions,
        resolveFiles: jest.fn(),
        createTemplateArgs: jest.fn(),
        resolveDestinationFolder: jest.fn()
      }
    };
    const answers = await instance.resolveTemplateAnswers(template);

    expect(typeof answers).toBe('object');
    expect(resolveQuestions).toHaveBeenCalledTimes(1);
    expect(groupQuestionsByType).toHaveBeenCalledTimes(1);
    expect(groupQuestionsByType).toHaveBeenCalledWith(resolvedQuestions);
  });

  it('should execute inquirers "prompt" method with the "interactiveQuestions" array', async () => {
    const template = {
      cwd: '/foo',
      config: {
        id: 'foo-template',
        description: 'foo',
        resolveQuestions: jest.fn(() => []),
        resolveFiles: jest.fn(),
        createTemplateArgs: jest.fn(),
        resolveDestinationFolder: jest.fn()
      }
    };
    const interactiveQuestions = [];
    groupQuestionsByType.mockReturnValueOnce({
      interactiveQuestions,
      implicitAnswers: {},
      implicitQuestions: []
    });
    const answers = await instance.resolveTemplateAnswers(template);

    expect(typeof answers).toBe('object');
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(prompt).toHaveBeenCalledWith(interactiveQuestions);
  });
});

describe('new DefaultCommand().groupQuestionsByType()', () => {
  let instance;

  beforeEach(() => {
    instance = new DefaultCommand({input: [], flags: {}});
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    const instance = new DefaultCommand({input: [], flags: {}});

    expect(typeof instance.groupQuestionsByType).toBe('function');
  });

  it('should group the given questions depending on the factor if the value was provided in the processes arguments.', async () => {
    instance.cli.flags = {
      myImplicitQuestion: 'foo'
    };
    const results = await instance.groupQuestionsByType([
      {
        name: 'myInteractiveQuestion',
        type: 'input',
        message: 'You should really type this'
      },
      {
        name: 'myImplicitQuestion',
        type: 'input',
        message: 'You should really type this'
      }
    ]);

    expect(typeof results).toBe('object');
    expect(results.interactiveQuestions).toHaveLength(1);
    expect(results.implicitQuestions).toHaveLength(1);
    expect(results.implicitAnswers.myImplicitQuestion).toBe('foo');
  });

  it('should respect the questions "validate" and "filter" functions.', async () => {
    const filter = jest.fn(value => value + 'bar');
    const validate = jest.fn(value => value);

    instance.cli.flags = {
      myImplicitQuestion: 'foo'
    };
    await instance.groupQuestionsByType([
      {
        name: 'myImplicitQuestion',
        type: 'input',
        message: 'You should really type this',
        validate,
        filter
      }
    ]);

    expect(filter).toHaveBeenCalledTimes(1);
    expect(filter).toHaveBeenCalledWith('foo');

    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate).toHaveBeenCalledWith('foobar');
  });
});

describe('new DefaultCommand() template feedback handlers', () => {
  let instance;
  let log;
  let opts;

  beforeEach(() => {
    instance = new DefaultCommand({input: [], flags: {}});
    log = jest.spyOn(instance, 'log').mockImplementation(jest.fn());
    opts = {
      filePaths: {
        src: '/foo',
        dist: '/bar'
      },
      context: {},
      data: {
        raw: 'foo',
        processed: 'bar'
      }
    };
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('onBeforeReadFile()', () => {
    it('should be a function', () => {
      const instance = new DefaultCommand({input: [], flags: {}});

      expect(typeof instance.onBeforeReadFile).toBe('function');
    });

    it('should call the instances log method.', async () => {
      await instance.onBeforeReadFile(opts);

      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('onBeforeProcessFile()', () => {
    it('should be a function', () => {
      const instance = new DefaultCommand({input: [], flags: {}});

      expect(typeof instance.onBeforeProcessFile).toBe('function');
    });

    it('should call the instances log method.', async () => {
      await instance.onBeforeProcessFile(opts);

      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('onBeforeWriteFile()', () => {
    it('should be a function', () => {
      const instance = new DefaultCommand({input: [], flags: {}});

      expect(typeof instance.onBeforeWriteFile).toBe('function');
    });

    it('should call the instances log method.', async () => {
      await instance.onBeforeWriteFile(opts);

      expect(log).toHaveBeenCalledTimes(1);
    });
  });

  describe('onAfterWriteFile()', () => {
    it('should be a function', () => {
      const instance = new DefaultCommand({input: [], flags: {}});

      expect(typeof instance.onAfterWriteFile).toBe('function');
    });

    it('should call the instances log method.', async () => {
      await instance.onAfterWriteFile(opts);

      expect(log).toHaveBeenCalledTimes(1);
    });
  });
});

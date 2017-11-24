// @flow

jest.mock('./file.js');
jest.mock('./logger.js');

const file: any = require('./file.js');
const template = require('./template.js');

describe('template.createDecoratedTemplateArgs()', () => {
  it('should be a function', () => {
    expect(typeof template.createDecoratedTemplateArgs).toBe('function');
  });

  it('should decorate the given argsByKey with lodashs string manipulation methods and return a newly shaped object with the same keys.', () => {
    const args = template.createDecoratedTemplateArgs({
      foo: 'Foo example',
      bar: 'bar example',
      baz: 'baz-example'
    });

    expect(args).toMatchSnapshot();
  });
});

describe('template.trimFilePath()', () => {
  it('should be a function', () => {
    expect(typeof template.trimFilePath).toBe('function');
  });

  it('should remove starting slashes from the given string.', () => {
    expect(template.trimFilePath('/foo/bar')).toBe('foo/bar');
    expect(template.trimFilePath('foo/bar')).toBe('foo/bar');
    expect(template.trimFilePath('foo/bar/')).toBe('foo/bar/');
  });
});

describe('template.processTemplateAndCreate()', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof template.processTemplateAndCreate).toBe('function');
  });

  it('should iterate over all filePatterns of the given directory. process the contents with the given arguments and write the filePatterns to the "distDir" location.', async () => {
    file.globAsync.mockReturnValueOnce([
      '/usr/foo/package.json',
      '/usr/foo/{{=it.name}}/foo.txt'
    ]);
    file.readdirAsync.mockReturnValue([]);
    file.readFileAsync
      .mockReturnValueOnce('{"name": "{{=it.name}}"}')
      .mockReturnValueOnce(
        'The application name is: {{=it.name.toUpperCase()}}'
      );

    const args = {
      name: 'My App'
    };

    await template.processTemplateAndCreate({
      srcDir: '/usr/foo',
      distDir: '/usr/bar',
      filePatterns: ['src/*'],
      args
    });

    expect(file.globAsync).toHaveBeenCalledTimes(1);
    expect(file.globAsync).toHaveBeenCalledWith(['/usr/foo/src/*'], {
      ignore: [],
      nodir: true,
      symlinks: false
    });

    expect(file.ensureDir).toHaveBeenCalledTimes(1);
    expect(file.ensureDir).toHaveBeenCalledWith('/usr/bar');

    expect(file.readFileAsync).toHaveBeenCalledTimes(2);
    expect(file.readFileAsync).toHaveBeenCalledWith(
      '/usr/foo/package.json',
      'utf8'
    );
    expect(file.readFileAsync).toHaveBeenCalledWith(
      '/usr/foo/{{=it.name}}/foo.txt',
      'utf8'
    );

    expect(file.writeFileAsync).toHaveBeenCalledTimes(2);
    expect(file.writeFileAsync).toHaveBeenCalledWith(
      '/usr/bar/package.json',
      '{"name": "My App"}'
    );
    expect(file.writeFileAsync).toHaveBeenCalledWith(
      '/usr/bar/My App/foo.txt',
      'The application name is: MY APP'
    );
  });

  it('should not read or write any files if the directory is not empty.', async () => {
    file.readdirAsync.mockReturnValue(['foo']);

    await template.processTemplateAndCreate({
      srcDir: '/usr/foo',
      distDir: '/usr/bar',
      filePatterns: ['src/*'],
      args: {}
    });

    expect(file.readFileAsync).toHaveBeenCalledTimes(0);
    expect(file.writeFileAsync).toHaveBeenCalledTimes(0);
  });
});

describe('template.resolveTemplateConfigsById()', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // $FlowFixMe: Ignore errors since the jest type-def is out of date.
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be a function', () => {
    expect(typeof template.resolveTemplateConfigsById).toBe('function');
  });

  it('should resolve all template configs by their id', async () => {
    file.globAsync.mockReturnValue([
      '/foo/some-template/my-template-config.js',
      '/foo/another-template/my-template-config.js',
      '/foo/yet-another-template/my-template-config.js',
      '/foo/duplicate-template/my-template-config.js'
    ]);
    const fooConfig = {
      id: 'foo',
      resolveFiles: jest.fn(),
      createTemplateArgs: jest.fn()
    };
    file.require
      .mockReturnValueOnce()
      .mockReturnValueOnce({})
      .mockReturnValue(fooConfig);

    const configs = await template.resolveTemplateConfigsById(
      '/foo',
      ['templates/*'],
      'my-template-config.js'
    );

    expect(typeof configs).toBe('object');
    expect(typeof configs.foo).toBe('object');
    expect(configs.foo.cwd).toBe('/foo/yet-another-template/');
    expect(configs.foo.config).toEqual(fooConfig);
  });
});

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
  afterEach(() => {
    file.readdirAsync.mockReset();
    file.writeFileAsync.mockReset();
    file.readFileAsync.mockReset();
    file.globAsync.mockReset();
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

    expect(file.globAsync.mock.calls.length).toBe(1);
    expect(file.globAsync.mock.calls[0][0]).toBe('/usr/foo/src/*');

    expect(file.ensureDir.mock.calls.length).toBe(1);
    expect(file.ensureDir.mock.calls[0][0]).toBe('/usr/bar');

    expect(file.readFileAsync.mock.calls.length).toBe(2);
    expect(file.readFileAsync.mock.calls[0][0]).toBe('/usr/foo/package.json');
    expect(file.readFileAsync.mock.calls[1][0]).toBe(
      '/usr/foo/{{=it.name}}/foo.txt'
    );

    expect(file.writeFileAsync.mock.calls.length).toBe(2);
    expect(file.writeFileAsync.mock.calls[0][0]).toBe('/usr/bar/package.json');
    expect(file.writeFileAsync.mock.calls[0][1]).toBe('{"name": "My App"}');
    expect(file.writeFileAsync.mock.calls[1][0]).toBe(
      '/usr/bar/My App/foo.txt'
    );
    expect(file.writeFileAsync.mock.calls[1][1]).toBe(
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

    expect(file.readFileAsync.mock.calls.length).toBe(0);
    expect(file.writeFileAsync.mock.calls.length).toBe(0);
  });
});

describe('template.resolveTemplateConfigsById()', () => {
  afterEach(() => {
    file.readdirAsync.mockReset();
    file.writeFileAsync.mockReset();
    file.readFileAsync.mockReset();
    file.globAsync.mockReset();
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
    const fooConfig = {id: 'foo'};
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
    expect(configs.foo.config).toBe(fooConfig);
  });
});

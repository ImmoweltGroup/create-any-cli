// @flow

jest.mock('./file.js');
jest.mock('./logger.js');

const file: any = require('./file.js');
const template = require('./template.js');

describe('template.createArgs()', () => {
  it('should be a function', () => {
    expect(typeof template.createArgs).toBe('function');
  });

  it('should decorate the given argsByKey with lodashs string manipulation methods and return a newly shaped object with the same keys.', () => {
    const args = template.createArgs({
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
  it('should be a function', () => {
    expect(typeof template.processTemplateAndCreate).toBe('function');
  });

  it('should iterate over all files of the given directory. process the contents with the given arguments and write the files to the "distDir" location.', async () => {
    file.globAsync.mockReturnValueOnce([
      '/usr/foo/package.json',
      '/usr/foo/<%= args.name %>/foo.txt'
    ]);
    file.readFileAsync
      .mockReturnValueOnce('{"name": "<%= args.name %>"}')
      .mockReturnValueOnce(
        'The application name is: <%= args.name.toUpperCase() %>'
      );

    const args = {name: 'my-app'};

    await template.processTemplateAndCreate({
      templateDir: '/usr/foo',
      distDir: '/usr/bar',
      args
    });

    expect(file.globAsync.mock.calls.length).toBe(1);
    expect(file.globAsync.mock.calls[0][0]).toBe('/usr/foo/**/*');

    expect(file.ensureDir.mock.calls.length).toBe(1);
    expect(file.ensureDir.mock.calls[0][0]).toBe('/usr/bar');

    expect(file.readFileAsync.mock.calls.length).toBe(2);
    expect(file.readFileAsync.mock.calls[0][0]).toBe('/usr/foo/package.json');
    expect(file.readFileAsync.mock.calls[1][0]).toBe(
      '/usr/foo/<%= args.name %>/foo.txt'
    );

    expect(file.writeFileAsync.mock.calls.length).toBe(2);
    expect(file.writeFileAsync.mock.calls[0][0]).toBe('/usr/bar/package.json');
    expect(file.writeFileAsync.mock.calls[0][1]).toBe('{"name": "my-app"}');
    expect(file.writeFileAsync.mock.calls[1][0]).toBe(
      '/usr/bar/my-app/foo.txt'
    );
    expect(file.writeFileAsync.mock.calls[1][1]).toBe(
      'The application name is: MY-APP'
    );
  });
});

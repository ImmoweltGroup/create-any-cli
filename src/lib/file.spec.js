// @flow

const file = require('./file.js');

describe('file.globAsync()', () => {
  let globAsync;

  beforeEach(() => {
    globAsync = jest
      .spyOn(file._utils, 'globAsync')
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    globAsync.mockRestore();
  });

  it('should be a function', () => {
    expect(typeof file.globAsync).toBe('function');
  });

  it('should call the _utils.globAsync method directly with all arguments in the first argument is not an array', async () => {
    const expectedFiles = ['/usr/foo/package.json'];
    globAsync.mockReturnValue(expectedFiles);

    const args = ['foo', 'bar'];

    const files = await file.globAsync(...args);

    expect(globAsync.mock.calls.length).toBe(1);
    expect(globAsync.mock.calls[0]).toEqual(args);
    expect(files).toEqual(expectedFiles);
  });

  it('should call the _utils.globAsync method multiple times if the first argument is an array of strings', async () => {
    globAsync
      .mockReturnValueOnce(['/usr/foo/package.json'])
      .mockReturnValueOnce(['/usr/bar/package.json']);

    const files = await file.globAsync(['foo', 'baz'], 'bar');

    expect(globAsync.mock.calls.length).toBe(2);
    expect(globAsync.mock.calls[0][0]).toEqual('foo');
    expect(globAsync.mock.calls[0][1]).toEqual('bar');
    expect(globAsync.mock.calls[1][0]).toEqual('baz');
    expect(globAsync.mock.calls[1][1]).toEqual('bar');
    expect(files).toEqual(['/usr/foo/package.json', '/usr/bar/package.json']);
  });
});

describe('file.readFileAsync()', () => {
  it('should be a function', () => {
    expect(typeof file.readFileAsync).toBe('function');
  });
});

describe('file.writeFileAsync()', () => {
  it('should be a function', () => {
    expect(typeof file.writeFileAsync).toBe('function');
  });
});

describe('file.ensureDir()', () => {
  it('should be a function', () => {
    expect(typeof file.ensureDir).toBe('function');
  });
});

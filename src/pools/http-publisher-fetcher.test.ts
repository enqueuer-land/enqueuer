import { HttpPublisherFetcher } from './http-publisher-fetcher';

jest.spyOn(global, 'fetch');

const fetchMock: jest.Mock = fetch as jest.Mock;

describe('HttpPublisherFetcher', () => {
  beforeEach(() => {
    fetchMock.mockClear();
  });

  it('Should resolve request result', async () => {
    (fetch as jest.Mock).mockImplementationOnce(() => {
      const headers = new Headers();
      headers.set('headerA', 'a');
      headers.set('header-1', '1');

      return Promise.resolve({
        text: () => Promise.resolve('body'),
        headers: headers,
        status: 200
      });
    });

    const result = await new HttpPublisherFetcher('url', 'method', { key: 'value' }, 'body', 1000).request();
    expect(result).toEqual({
      body: 'body',
      headers: { headera: 'a', 'header-1': '1' },
      status: 200,
      statusCode: 200
    });
    expect(fetchMock).toHaveBeenCalledWith('url', {
      method: 'method',
      headers: {
        key: 'value',
        'Content-Length': 4
      },
      body: 'body',
      agent: expect.any(Object),
      signal: expect.any(Object)
    });
  });

  it('Should reject request result', async () => {
    const requestMock = jest.fn((options, cb) => {
      expect(options.headers).toEqual({ 'Content-Length': 0 });
      expect(options.timeout).toBe(3000);
      cb('error');
    });
    (fetch as jest.Mock).mockImplementationOnce(requestMock);
    await expect(new HttpPublisherFetcher('', '', undefined, '').request()).rejects.toBeDefined();
  });
});

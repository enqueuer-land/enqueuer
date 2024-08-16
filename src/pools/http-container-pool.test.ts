import { HttpContainerPool } from './http-container-pool';
import { HttpContainer } from './http-container';
import { Logger } from '../loggers/logger';

let acquireMock = jest.fn(() => Promise.resolve('acquireReturn'));
let releaseMock = jest.fn(cb => cb());

jest.mock('./http-container');
let constructorHttpContainer = jest.fn(() => {
  return {
    acquire: acquireMock,
    release: releaseMock
  };
});
// @ts-expect-error
HttpContainer.mockImplementation(constructorHttpContainer);

jest.mock('../loggers/logger');
const warningLogMock = jest.fn();
// @ts-expect-error
Logger.warning.mockImplementation(warningLogMock);

describe('HttpContainerPool', () => {
  beforeEach(() => {
    acquireMock.mockClear();
    releaseMock.mockClear();
    constructorHttpContainer.mockClear();
  });

  it('create new App', async () => {
    const port = 987;
    const credentials = { key: 'value' };

    const result = await HttpContainerPool.getApp(port, true, credentials);

    expect(result).toEqual('acquireReturn');
    expect(constructorHttpContainer).toHaveBeenCalledWith(port, credentials);
    expect(acquireMock).toHaveBeenCalled();
  });

  it('reuse App', async () => {
    const port = 987;
    const secure = true;
    const credentials = { key: 'value' };

    await HttpContainerPool.getApp(port, secure, credentials);
    const result = await HttpContainerPool.getApp(port, secure, credentials);

    expect(result).toBe('acquireReturn');
    expect(constructorHttpContainer).not.toHaveBeenCalled();
    expect(acquireMock).toHaveBeenCalledTimes(2);
  });

  it('release non existent App', async () => {
    const port = 3245612;
    await HttpContainerPool.releaseApp(port);

    expect(releaseMock).not.toHaveBeenCalled();
  });
});

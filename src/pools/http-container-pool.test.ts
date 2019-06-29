import {HttpContainerPool} from './http-container-pool';
import {HttpContainer} from './http-container';
import {Logger} from '../loggers/logger';

let acquireMock = jest.fn(() => Promise.resolve('acquireReturn'));
let releaseMock = jest.fn((cb) => cb());

jest.mock('./http-container');
let constructorHttpContainer = jest.fn(() => {
    return {
        acquire: acquireMock,
        release: releaseMock
    };
});
HttpContainer.mockImplementation(constructorHttpContainer);

jest.mock('../loggers/logger');
const warningLogMock = jest.fn();
Logger.warning.mockImplementation(warningLogMock);

describe('HttpContainerPool', () => {

    beforeEach(() => {
        acquireMock.mockClear();
        releaseMock.mockClear();
        constructorHttpContainer.mockClear();
    });

    it('create new App', done => {
        const port = 987;
        const credentials = {key: 'value'};

        const appPromise = HttpContainerPool.getApp(port, true, credentials);

        appPromise.then((some) => {
            expect(some).toEqual('acquireReturn');
            done();
        });
        expect(constructorHttpContainer).toHaveBeenCalledWith(port, credentials);
        expect(acquireMock).toHaveBeenCalled();
    });

    it('reuse App', done => {

        const port = 987;
        const secure = true;
        const credentials = {key: 'value'};

        HttpContainerPool.getApp(port, secure, credentials).then(() => {
            const appPromise = HttpContainerPool.getApp(port, secure, credentials);

            appPromise.then((some) => {
                expect(some).toBe('acquireReturn');
                done();
            });
            expect(constructorHttpContainer).toHaveBeenCalledTimes(1);
            expect(acquireMock).toHaveBeenCalledTimes(2);
        });
    });

    it('release non existent App', done => {
        const port = 3245612;
        HttpContainerPool.releaseApp(port).then(() => {

            expect(releaseMock).not.toHaveBeenCalled();
            done();
        });

    });

});

import {Configuration} from './configurations/configuration';
import {start} from './index';
import {EnqueuerStarter} from './enqueuer-starter';
import {Logger} from './loggers/logger';

jest.mock('./configurations/configuration');
jest.mock('./enqueuer-starter');
jest.mock('./loggers/logger');

Configuration.getInstance.mockImplementation(() => {
    return {
        getLogLevel: () => 'index-level'
    };
});

const statusCode = 6;
let startMock = jest.fn(() => Promise.resolve(statusCode));
let enqueuerConstructorMock = jest.fn(() => {
    return {
        start: startMock
    };
});

EnqueuerStarter.mockImplementation(enqueuerConstructorMock);

let setLoggerLevelMock = jest.fn();
Logger.setLoggerLevel.mockImplementation(() => setLoggerLevelMock);
Logger.mockImplementation(() => {
});

describe('Index', () => {

    it('Should call set logger level', async () => {
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(await start()).toEqual(statusCode);
        expect(Logger.setLoggerLevel).toHaveBeenCalledWith('index-level');
    });

    it('Should return value', async () => {
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(await start()).toEqual(statusCode);
        expect(startMock).toHaveBeenCalledTimes(1);
        expect(startMock).toHaveBeenCalledWith();
    });

    it('Should reject value', async () => {
        startMock = jest.fn(() => Promise.reject('reason'));

        try {
            await start();
        } catch (status) {
            expect(status).toBe(1);
            expect(startMock).toHaveBeenCalledTimes(1);
            expect(startMock).toHaveBeenCalledWith();
        }
    });

});

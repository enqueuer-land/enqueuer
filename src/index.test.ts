import {start} from "./index";
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';


const statusCode = 6;
let startMock = jest.fn(() => Promise.resolve(statusCode));
let enqueuerConstructorMock = jest.fn(() => {
    return {
        start: startMock
    };
});

jest.mock('./enqueuer-starter');
EnqueuerStarter.mockImplementation(enqueuerConstructorMock);


let getLogLevelMock = jest.fn(() => {
    return 'logLevelTest';
});
let isQuietModeMock = jest.fn(() => true);
let configurationConstructorReturn = {
    getLogLevel: getLogLevelMock,
    isQuietMode: isQuietModeMock
};

jest.mock('./configurations/configuration');
Configuration.mockImplementation(() => configurationConstructorReturn);

let setLoggerLevelMock = jest.fn();
jest.mock('./loggers/logger');
Logger.setLoggerLevel.mockImplementation(() => setLoggerLevelMock);
Logger.disable.mockImplementation();
Logger.mockImplementation(() => {});

describe('Index', () => {
    beforeEach(() => {

    });

    it('Should call configuration stuff', () => {
        expect.assertions(3);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(Configuration).toHaveBeenCalled();
        expect(getLogLevelMock).toHaveBeenCalledTimes(1);
    });

    it('Should call set logger level', () => {
        expect.assertions(3);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(getLogLevelMock).toHaveBeenCalledTimes(2);
        expect(Logger.setLoggerLevel).toHaveBeenCalledWith('logLevelTest');
    });

    it('Should set quiet mode', () => {
        isQuietModeMock = jest.fn(() => true);

        expect.assertions(3);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(getLogLevelMock).toHaveBeenCalled();
        expect(Logger.disable).toHaveBeenCalledWith();
    });

    it('Should return value', () => {
        expect.assertions(4);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(enqueuerConstructorMock).toHaveBeenCalledWith(configurationConstructorReturn);
        expect(startMock).toHaveBeenCalledTimes(1);
        expect(startMock).toHaveBeenCalledWith();
    });

    it('Should reject value', () => {
        expect.assertions(3);
        startMock = jest.fn(() => Promise.reject('reason'));

        expect(start()).rejects.toBe('reason')
        expect(startMock).toHaveBeenCalledTimes(1);
        expect(startMock).toHaveBeenCalledWith();
    });

});
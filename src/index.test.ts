import {start} from "./index";
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';


const statusCode = 6;
let startMock = jest.fn(() => Promise.resolve(statusCode));
let enqueuerConstructorMock = jest.fn(() => {
    return {
        start: startMock
    };
});

jest.mock('./enqueuer-starter');
EnqueuerStarter.mockImplementation(enqueuerConstructorMock);


let logLevelMock = jest.fn();
const configurationConstructorReturn = {
    getLogLevel: logLevelMock
};
let configurationConstructorMock = jest.fn(() => {
    return configurationConstructorReturn
});

jest.mock('./configurations/configuration');
Configuration.mockImplementation(configurationConstructorMock);

describe('Index', () => {
    it('Should call configuration stuff', () => {
        expect.assertions(3);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(configurationConstructorMock).toHaveBeenCalledTimes(1);
        expect(logLevelMock).toHaveBeenCalledTimes(1);
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
import {start} from "./index";
import {EnqueuerStarter} from './enqueuer-starter';
import {Configuration} from './configurations/configuration';


const statusCode = 6;
let startMock = jest.fn(() => Promise.resolve(statusCode));

jest.mock('./enqueuer-starter');
EnqueuerStarter.mockImplementation(() => {
    return {
        start: startMock
    };
});


let logLevelMock = jest.fn();
let configurationConstructorMock = jest.fn(() => {
    return {
        getLogLevel: logLevelMock
    }
});

jest.mock('./configurations/configuration');
Configuration.mockImplementation(configurationConstructorMock);

describe('Index', () => {
    it('Should call configuration stuff', done => {
        startMock = jest.fn(() => Promise.resolve(statusCode));
        start().then(() => {
            expect(configurationConstructorMock).toHaveBeenCalledTimes(1);
            expect(logLevelMock).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('Should return value', done => {
        startMock = jest.fn(() => Promise.resolve(statusCode));
        start().then(status => {
            expect(startMock).toHaveBeenCalledTimes(1);
            expect(startMock).toHaveBeenCalledWith();
            expect(status).toBe(statusCode);
            done();
        });
    });

    it('Should reject value', done => {
        startMock = jest.fn(() => Promise.reject('reason'));
        start().catch(err => {
            expect(startMock).toHaveBeenCalledTimes(1);
            expect(startMock).toHaveBeenCalledWith();
            expect(err).toBe('reason');
            done();
        });
    });

});
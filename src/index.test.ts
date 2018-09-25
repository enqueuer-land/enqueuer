import {Configuration} from './configurations/configuration';
import {start} from "./index";
import {EnqueuerStarter} from './enqueuer-starter';
import {Logger} from './loggers/logger';
import {ConfigurationValues} from "./configurations/configuration-values";

let configurationGetReturn: ConfigurationValues = {
        logLevel: 'logLevelTest',
        quiet: true,
        runMode: {
            daemon: [],
            'single-run': {
                name: 'anyName',
                reportName: 'reportNameSingle',
                parallel: true,
                files: [],
            }
        },
        outputs: [],
        store: {}
    }
;

jest.mock('./configurations/configuration');

let getValuesMock;
const remockConfiguration = (values = configurationGetReturn) => {
    getValuesMock = jest.fn(() => {
        return configurationGetReturn
    });
    Configuration.getValues.mockImplementationOnce(getValuesMock);
};


const statusCode = 6;
let startMock = jest.fn(() => Promise.resolve(statusCode));
let enqueuerConstructorMock = jest.fn(() => {
    return {
        start: startMock
    };
});

jest.mock('./enqueuer-starter');
EnqueuerStarter.mockImplementation(enqueuerConstructorMock);


let setLoggerLevelMock = jest.fn();
jest.mock('./loggers/logger');
Logger.setLoggerLevel.mockImplementation(() => setLoggerLevelMock);
Logger.mockImplementation(() => {});

describe('Index', () => {

    beforeEach(() => {
        remockConfiguration();
    });

    afterEach(() => {
        Configuration.getValues.mockClear();
        Configuration.getValues.mockReset();
    });

    it('Should call configuration stuff', () => {
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(getValuesMock).toHaveBeenCalledTimes(1);
    });

    it('Should call set logger level', () => {
        expect.assertions(3);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(getValuesMock).toHaveBeenCalledTimes(1);
        expect(Logger.setLoggerLevel).toHaveBeenCalledWith('logLevelTest');
    });

    it('Should not set quiet mode', () => {
        configurationGetReturn.quiet = false;
        remockConfiguration();
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
    });

    it('Should return value', () => {
        expect.assertions(4);
        startMock = jest.fn(() => Promise.resolve(statusCode));

        expect(start()).resolves.toEqual(statusCode);
        expect(enqueuerConstructorMock).toHaveBeenCalledWith(configurationGetReturn);
        expect(startMock).toHaveBeenCalledTimes(1);
        expect(startMock).toHaveBeenCalledWith();
    });

    it('Should reject value', () => {
        expect.assertions(2);
        startMock = jest.fn(() => Promise.reject('reason'));

        expect(start()).rejects.toBe('reason');
        expect(startMock).toHaveBeenCalledTimes(1);
        expect(startMock).toHaveBeenCalledWith();
    });

});
import {EnqueuerStarter} from './enqueuer-starter';
import {SingleRunExecutor} from './single-run-executor';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';

jest.mock('./single-run-executor');
jest.mock('./configurations/configuration');
jest.mock('./loggers/logger');

const enqueuerStarterLevel = 'enqueuer-starter-level';
// @ts-ignore
Configuration.getInstance.mockImplementation(() => {
    return {
        getLogLevel: () => enqueuerStarterLevel
    };
});

describe('EnqueuerStarter', () => {
    it('Should translate true to 0', async () => {
        // @ts-ignore
        SingleRunExecutor.mockImplementationOnce(() => {
            return {
                execute: () => true
            };
        });

        expect(await new EnqueuerStarter().start()).toBe(0);
    });

    it('Should translate false to 1', async () => {
        // @ts-ignore
        SingleRunExecutor.mockImplementationOnce(() => {
            return {
                execute: () => false
            };
        });

        expect(await new EnqueuerStarter().start()).toBe(1);
    });

    it('Should translate error to -1', async () => {
        // @ts-ignore
        SingleRunExecutor.mockImplementationOnce(() => {
            return {
                execute: () => {
                    throw `error`;
                }
            };
        });

        expect(await new EnqueuerStarter().start()).toBe(-1);
    });

    it('Should set logger level', () => {
        const loggerLevelMock = jest.fn();
        // @ts-ignore
        Logger.setLoggerLevel.mockImplementationOnce(loggerLevelMock);

        const enqueuerStarter = new EnqueuerStarter();

        expect(loggerLevelMock).toHaveBeenCalledWith(enqueuerStarterLevel);
    });

});

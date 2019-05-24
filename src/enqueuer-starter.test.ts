import {EnqueuerStarter} from './enqueuer-starter';
import {EnqueuerRunner} from './enqueuer-runner';
import {Configuration} from './configurations/configuration';
import {Logger} from './loggers/logger';

jest.mock('./enqueuer-runner');
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
        EnqueuerRunner.mockImplementationOnce(() => ({execute: () => []}));

        expect(await new EnqueuerStarter().start()).toBe(0);
    });

    it('Should translate false to 1', async () => {
        // @ts-ignore
        EnqueuerRunner.mockImplementationOnce(() => ({execute: () => [{valid: false}]}));

        expect(await new EnqueuerStarter().start()).toBe(1);
    });

    it('Should translate error to -1', async () => {
        // @ts-ignore
        EnqueuerRunner.mockImplementationOnce(() => {
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

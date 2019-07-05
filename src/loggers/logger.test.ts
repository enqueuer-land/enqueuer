import {Logger} from './logger';
import {DateController} from '../timers/date-controller';
import {LogLevel} from './log-level';

jest.mock('../timers/date-controller');

DateController.mockImplementation(() => {
    return {
        toString: () => 'date',
    };
});

const consoleLogMock = jest.fn(() => ``);
console.log = consoleLogMock;

describe('Logger', () => {
    beforeEach(() => {
        // @ts-ignore
        delete Logger.logLevel;
        consoleLogMock.mockClear();
        Logger.setLoggerLevel(LogLevel.WARN);
    });

    it('should format properly', () => {
        Logger.fatal('message');
        // @ts-ignore
        const message: string = consoleLogMock.mock.calls[0][0];

        expect(consoleLogMock).toHaveBeenCalled();
        expect(message).toContain('[date] [FATAL] - message');

    });

    it('should not print less priority messages', () => {
        Logger.trace('message');

        expect(consoleLogMock).not.toHaveBeenCalled();

    });

    it('should change priority', () => {
        Logger.trace('message');

        expect(consoleLogMock).not.toHaveBeenCalled();

        Logger.setLoggerLevel(LogLevel.TRACE);
        Logger.trace('message');

        expect(consoleLogMock).toHaveBeenCalled();

    });

    it('should PRINT category', () => {
        Logger.setLoggerLevel(LogLevel.TRACE);
        Logger.trace('message');
        Logger.debug('message');
        Logger.info('message');
        Logger.warning('message');
        Logger.error('message');
        Logger.fatal('message');

        // @ts-ignore
        const calls: string[] = consoleLogMock.mock.calls;

        expect(calls[0][0]).toContain('TRACE');
        expect(calls[1][0]).toContain('DEBUG');
        expect(calls[2][0]).toContain('INFO');
        expect(calls[3][0]).toContain('WARN');
        expect(calls[4][0]).toContain('ERROR');
        expect(calls[5][0]).toContain('FATAL');
    });
});

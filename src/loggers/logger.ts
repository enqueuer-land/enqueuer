import { LogLevel } from './log-level';
import { DateController } from '../timers/date-controller';

export class Logger {
    private static logLevel?: LogLevel;

    public static setLoggerLevel(level: LogLevel): void {
        Logger.logLevel = level;
    }

    public static trace(message: string) {
        Logger.logIfNecessary(message, LogLevel.TRACE);
    }

    public static debug(message: string) {
        Logger.logIfNecessary(message, LogLevel.DEBUG);
    }

    public static info(message: string) {
        Logger.logIfNecessary(message, LogLevel.INFO);
    }

    public static warning(message: string) {
        Logger.logIfNecessary(message, LogLevel.WARN);
    }

    public static error(message: string) {
        Logger.logIfNecessary(message, LogLevel.ERROR);
    }

    public static fatal(message: string) {
        Logger.logIfNecessary(message, LogLevel.FATAL);
    }

    private static getLogger(): LogLevel {
        if (!Logger.logLevel) {
            Logger.logLevel = LogLevel.WARN;
        }
        return Logger.logLevel;
    }

    private static logIfNecessary(message: string, level: LogLevel) {
        const logger = Logger.getLogger();
        if (logger.hasPriorityLessThanOrEqualTo(level)) {
            const date = new DateController().toString();
            const category = level.toString();
            const pattern = `[${date}] [${category}] - ${message}`;
            console.log(level.getColorFunction()(pattern));
        }
    }
}

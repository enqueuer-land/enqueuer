import * as log4js from 'log4js';

export class Logger {

    private static logger?: log4js.Logger;

    public static setLoggerLevel(level?: string): void {
        if (level)
            Logger.getLogger().level = level;
    }
    public static trace(message: string) {
        Logger.getLogger().trace(message);
    }
    public static debug(message: string) {
        Logger.getLogger().debug(message);
    }
    public static info(message: string) {
        Logger.getLogger().info(message);
    }
    public static warning(message: string) {
        Logger.getLogger().warn(message);
    }
    public static error(message: string) {
        Logger.getLogger().error(message);
    }
    public static fatal(message: string) {
        Logger.getLogger().fatal(message);
    }
    private static getLogger(): any {
        if (!Logger.logger) {
            Logger.logger = log4js.getLogger();
        }
        return Logger.logger;
    }
}
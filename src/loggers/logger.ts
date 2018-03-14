import { getLogger } from 'log4js';

export class Logger {

    private static logger: any = undefined;

    public static setLoggerLevel(level: string | undefined): void {
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
            Logger.logger = getLogger();
        }
        return Logger.logger;
    }
}
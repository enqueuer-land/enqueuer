import * as log4js from 'log4js';

export class Logger {

    private static logger?: any;

    public static setLoggerLevel(level?: string): void {
        if (level) {
            Logger.getLogger().level = level;
        }
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

if (process.argv[1].toString().match('jest')) {
    console.log = function() {
        //empty
    };
    Logger.trace = () => {
        /*do nothing*/
    };
    Logger.debug = () => {
        /*do nothing*/
    };
    Logger.info = () => {
        /*do nothing*/
    };
    Logger.warning = () => {
        /*do nothing*/
    };
    Logger.error = () => {
        /*do nothing*/
    };
    Logger.fatal = () => {
        /*do nothing*/
    };
}
import * as log4js from 'log4js';

export class Logger {

    private static logger?: log4js.Logger;

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

            // log4js.configure({
            //     appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
            //     categories: { default: { appenders: ['cheese'], level: 'error' } }
            // });
            //
            //
            log4js.configure({
                appenders: {
                    regularOutput: {
                        level: 'TRACE',
                        maxLevel: 'INFO',
                        type: 'console'
                    },
                    errorOutput: {
                        level: 'WARN',
                        type: 'stderr',
                    }
                    // ,
                    // errors: {
                    //     type: 'logLevelFilter',
                    //     level: 'WARNING',
                    //     appender: 'stderr'
                    // }
                },
                categories: {
                    default: {
                        appenders: ['regularOutput', 'errorOutput'],
                        level: 'WARN'
                    }
                }
            });
            Logger.logger = log4js.getLogger();

        }
        return Logger.logger;
    }
}
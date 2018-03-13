import { getLogger } from 'log4js';
import {Configuration} from "../configurations/configuration";


export class Logger {
    private static singleton: Logger = new Logger();

    private logger: any;

    private constructor() {
        this.logger = getLogger();
        // if (Configuration.getInstance())
        //     this.logger.level = Configuration.getInstance().getLogLevel();
    }

    public static setLoggerLevel(level: string): void {
        Logger.singleton.logger.level = level;
    }

    public static trace(message: string) {
        Logger.singleton.logger.trace(message);
    }
    public static debug(message: string) {
        Logger.singleton.logger.debug(message);
    }
    public static info(message: string) {
        Logger.singleton.logger.info(message);
    }
    public static warning(message: string) {
        Logger.singleton.logger.warn(message);
    }
    public static error(message: string) {
        Logger.singleton.logger.error(message);
    }
    public static fatal(message: string) {
        Logger.singleton.logger.fatal(message);
    }

}
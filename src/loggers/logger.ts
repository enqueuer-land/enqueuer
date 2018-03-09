import { getLogger } from 'log4js';
import {Configuration} from "../configurations/configuration";

const logger: any = getLogger();
logger.level = Configuration.getLogLevel(); //TODO: test which one is initialized first Logger or Configuration

export class Logger {

    public static trace(message: string) {
        logger.trace(message);
    }
    public static debug(message: string) {
        logger.debug(message);
    }
    public static info(message: string) {
        logger.info(message);
    }
    public static warning(message: string) {
        logger.warn(message);
    }
    public static error(message: string) {
        logger.error(message);
    }
    public static fatal(message: string) {
        logger.fatal(message);
    }

}
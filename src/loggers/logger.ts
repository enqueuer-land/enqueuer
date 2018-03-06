import { getLogger } from 'log4js';
import {Configuration} from "../conf/configuration";

const logger: any = getLogger();
if (Configuration.isVerboseMode())
    logger.level = 'debug';

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
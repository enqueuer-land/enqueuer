"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const log4js = __importStar(require("log4js"));
class Logger {
    static setLoggerLevel(level) {
        if (level) {
            Logger.getLogger().level = level;
        }
    }
    static trace(message) {
        Logger.getLogger().trace(message);
    }
    static debug(message) {
        Logger.getLogger().debug(message);
    }
    static info(message) {
        Logger.getLogger().info(message);
    }
    static warning(message) {
        Logger.getLogger().warn(message);
    }
    static error(message) {
        Logger.getLogger().error(message);
    }
    static fatal(message) {
        Logger.getLogger().fatal(message);
    }
    static getLogger() {
        if (!Logger.logger) {
            Logger.logger = log4js.getLogger();
        }
        return Logger.logger;
    }
}
exports.Logger = Logger;
if (process.argv[1].toString().match('jest')) {
    console.log = function () {
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

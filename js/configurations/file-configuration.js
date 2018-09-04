"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = __importStar(require("yamljs"));
const logger_1 = require("../loggers/logger");
class FileConfiguration {
    constructor(filename) {
        this.configurationFile = yaml.load(filename);
    }
    static reload(filename) {
        try {
            FileConfiguration.instance = new FileConfiguration(filename);
            return true;
        }
        catch (err) {
            FileConfiguration.instance = {
                configurationFile: {}
            };
            logger_1.Logger.error(`Error loading configuration file '${filename}': ${err}`);
        }
        return false;
    }
    static getLogLevel() {
        return FileConfiguration.getConfigurationFile()['log-level'];
    }
    static getRunMode() {
        return FileConfiguration.getConfigurationFile()['run-mode'];
    }
    static getOutputs() {
        return FileConfiguration.getConfigurationFile().outputs || [];
    }
    static getStore() {
        return FileConfiguration.getConfigurationFile().store || {};
    }
    static getConfigurationFile() {
        if (!FileConfiguration.instance) {
            FileConfiguration.reload(FileConfiguration.DEFAULT_FILENAME);
        }
        return FileConfiguration.instance.configurationFile;
    }
}
FileConfiguration.DEFAULT_FILENAME = 'enqueuer.yml';
exports.FileConfiguration = FileConfiguration;

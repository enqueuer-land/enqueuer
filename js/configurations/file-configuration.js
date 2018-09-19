"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const yaml_object_notation_1 = require("../object-notations/yaml-object-notation");
class FileConfiguration {
    constructor(filename) {
        this.configurationFile = new yaml_object_notation_1.YamlObjectNotation().loadFromFileSync(filename);
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_configuration_1 = require("./command-line-configuration");
const file_configuration_1 = require("./file-configuration");
class Configuration {
    refresh() {
        const configFileName = command_line_configuration_1.CommandLineConfiguration.getConfigFileName();
        if (configFileName != Configuration.configFileName) {
            file_configuration_1.FileConfiguration.reload(configFileName);
            Configuration.configFileName = configFileName;
        }
    }
    getLogLevel() {
        this.refresh();
        return command_line_configuration_1.CommandLineConfiguration.getLogLevel() ||
            file_configuration_1.FileConfiguration.getLogLevel() ||
            'warn';
    }
    getRunMode() {
        this.refresh();
        return file_configuration_1.FileConfiguration.getRunMode();
    }
    getOutputs() {
        this.refresh();
        return file_configuration_1.FileConfiguration.getOutputs();
    }
    getStore() {
        this.refresh();
        return Object.assign({}, file_configuration_1.FileConfiguration.getStore(), command_line_configuration_1.CommandLineConfiguration.getStore());
    }
    isQuietMode() {
        return command_line_configuration_1.CommandLineConfiguration.isQuietMode();
    }
}
exports.Configuration = Configuration;

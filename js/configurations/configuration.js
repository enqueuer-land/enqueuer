"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_line_configuration_1 = require("./command-line-configuration");
const file_configuration_1 = require("./file-configuration");
class Configuration {
    constructor() {
    }
    static getValues() {
        const configFileName = command_line_configuration_1.CommandLineConfiguration.getConfigFileName();
        if (!Configuration.instance || configFileName != Configuration.configFileName) {
            file_configuration_1.FileConfiguration.reload(configFileName);
            Configuration.instance = {
                logLevel: command_line_configuration_1.CommandLineConfiguration.getLogLevel() || file_configuration_1.FileConfiguration.getLogLevel() || 'warn',
                runMode: file_configuration_1.FileConfiguration.getRunMode(),
                outputs: file_configuration_1.FileConfiguration.getOutputs(),
                store: Object.assign({}, file_configuration_1.FileConfiguration.getStore(), command_line_configuration_1.CommandLineConfiguration.getStore()),
                quiet: command_line_configuration_1.CommandLineConfiguration.isQuietMode()
            };
        }
        Configuration.configFileName = configFileName;
        return Object.assign({}, Configuration.instance);
    }
}
exports.Configuration = Configuration;

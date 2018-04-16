"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const version = require('../../package.json').version;
const yaml = require('yamljs');
let configFileName = "conf/enqueuer.yml";
const fs = require("fs");
let commandLineVariables = {};
let commander = {};
if (!process.argv[1].toString().match("jest")) {
    commander = require('commander')
        .version(process.env.npm_package_version || version, '-V, --version')
        .option('-v, --verbose', 'Activates verbose mode', false)
        .option('-l, --log-level <level>', 'Set log level')
        .option('-c, --config-file <path>', 'Set configurationFile. Defaults to conf/enqueuer.yml')
        .option('-s, --session-variables [sessionVariable]', 'Add variables values to this session', (val, memo) => {
        const split = val.split("=");
        if (split.length == 2) {
            commandLineVariables[split[0]] = split[1];
        }
        memo.push(val);
        return memo;
    }, [])
        .parse(process.argv);
    configFileName = commander.configFile || configFileName;
}
let ymlFile = {};
try {
    ymlFile = yaml.load(configFileName);
}
catch (err) {
    logger_1.Logger.error(`Impossible to read ${configFileName} file: ${err}`);
    ymlFile = {};
}
class Configuration {
    constructor(commandLine = commander, configurationFile = ymlFile) {
        this.commandLine = commandLine;
        this.configurationFile = configurationFile;
        this.configurationFile.variables = this.configurationFile.variables || {};
    }
    getLogLevel() {
        if (this.commandLine.verbose)
            return 'trace';
        return (this.commandLine.logLevel) ||
            (this.configurationFile["log-level"]);
    }
    getRequisitionRunMode() {
        if (this.configurationFile.requisitions)
            return this.configurationFile.requisitions["run-mode"];
        else
            return undefined;
    }
    getOutputs() {
        if (!this.configurationFile.outputs)
            return [];
        return this.configurationFile.outputs;
    }
    getFileVariables() {
        return this.configurationFile.variables || {};
    }
    setFileVariable(name, value) {
        this.configurationFile.variables[name] = value;
        fs.writeFileSync(configFileName, yaml.stringify(this.configurationFile, 2));
    }
    deleteFileVariable(name) {
        delete this.configurationFile.variables[name];
        fs.writeFileSync(configFileName, yaml.stringify(this.configurationFile, 2));
    }
    getSessionVariables() {
        return commandLineVariables;
    }
    getFile() {
        return this.configurationFile;
    }
}
exports.Configuration = Configuration;

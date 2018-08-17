"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const yaml = __importStar(require("yamljs"));
const commander_1 = require("commander");
const packageJson = require('../../package.json');
let configFileName = '';
let commandLineStore = {};
let commander = {};
if (!process.argv[1].toString().match('jest')) {
    commander = new commander_1.Command()
        .version(process.env.npm_package_version || packageJson.version, '-v, --version')
        .usage('-c <confif-file-path>')
        .option('-q, --quiet', 'Disable logging', false)
        .option('-l, --log-level <level>', 'Set log level')
        .option('-c, --config-file <path>', 'Set configurationFile')
        .option('-s, --store [store]', 'Add variables values to this session', (val, memo) => {
        const split = val.split('=');
        if (split.length == 2) {
            commandLineStore[split[0]] = split[1];
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
    logger_1.Logger.error(`Impossible to read configuration file: ${configFileName} -> ${err}`);
    ymlFile = {};
}
class Configuration {
    constructor(commandLine = commander, configurationFile = ymlFile) {
        this.commandLine = commandLine;
        this.configurationFile = configurationFile;
        this.configurationFile.store = this.configurationFile.store || {};
    }
    getLogLevel() {
        return (this.commandLine.logLevel) ||
            (this.configurationFile['log-level']);
    }
    getRequisitionRunMode() {
        if (this.configurationFile) {
            return this.configurationFile['run-mode'];
        }
        return undefined;
    }
    getOutputs() {
        if (!this.configurationFile.outputs) {
            return [];
        }
        return this.configurationFile.outputs;
    }
    getStore() {
        return this.configurationFile.store || {};
    }
    isQuietMode() {
        return this.commandLine.quiet || false;
    }
    getFile() {
        return this.configurationFile;
    }
}
exports.Configuration = Configuration;

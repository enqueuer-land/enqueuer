"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const packageJson = require('../../package.json');
let commander = {};
const testMode = process.argv[1].toString().match('jest');
let commandLineStore = {};
let refreshCommander = (commandLineArguments) => {
    let commander = new commander_1.Command()
        .version(process.env.npm_package_version || packageJson.version, '-v, --version')
        .usage('[options] <confif-file-path>')
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
        .parse(commandLineArguments);
    return commander;
};
if (!testMode) {
    commander = refreshCommander(process.argv);
}
function commanderRefresher(newArguments) {
    if (testMode) {
        commander = refreshCommander(newArguments);
    }
}
exports.commanderRefresher = commanderRefresher;
class CommandLineConfiguration {
    constructor() {
        this.commandLine = commander;
    }
    static getCommandLine() {
        if (!CommandLineConfiguration.instance || testMode) {
            CommandLineConfiguration.instance = new CommandLineConfiguration();
        }
        return CommandLineConfiguration.instance.commandLine;
    }
    static isQuietMode() {
        return CommandLineConfiguration.getCommandLine().quiet;
    }
    static getLogLevel() {
        return CommandLineConfiguration.getCommandLine().logLevel;
    }
    static getConfigFileName() {
        const commandLine = CommandLineConfiguration.getCommandLine();
        let configFileName = commandLine.configFile;
        if (!configFileName) {
            const args = commandLine.args;
            if (args && args.length > 0) {
                configFileName = args[0];
            }
            else {
                configFileName = 'config.yml';
            }
        }
        return configFileName;
    }
    static getStore() {
        return commandLineStore;
    }
}
exports.CommandLineConfiguration = CommandLineConfiguration;

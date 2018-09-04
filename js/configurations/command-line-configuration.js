"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const packageJson = require('../../package.json');
let commandLineStore = {};
let commander = {};
const testMode = process.argv[1].toString().match('jest');
function commanderRefresher(newValue) {
    if (testMode) {
        commander = newValue;
    }
}
exports.commanderRefresher = commanderRefresher;
if (!testMode) {
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
}
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
        return CommandLineConfiguration.getCommandLine().configFile;
    }
    static getStore() {
        return CommandLineConfiguration.getCommandLine().commandLineStore;
    }
}
exports.CommandLineConfiguration = CommandLineConfiguration;

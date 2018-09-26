import {Command} from 'commander';
const packageJson = require('../../package.json');

let commander = {};

const testMode = process.argv[1].toString().match('jest');

let commandLineStore: any = {};
let libsToInstall: any = [];

let refreshCommander = (commandLineArguments: string[]) => {
    let commander = new Command()
        .version(process.env.npm_package_version || packageJson.version, '-v, --version')
        .usage('[options] <confif-file-path>')
        .option('-q, --quiet', 'Disable logging', false)
        .option('-b, --verbosity <level>', 'Set verbosity [trace, debug, info, warn, error, fatal]')
        .option('-c, --config-file <path>', 'Set configurationFile')
        .option('-s, --store [store]', 'Add variables values to this session',
            (val: string, memo: string[]) => {
                const split = val.split('=');
                if (split.length == 2) {
                    commandLineStore[split[0]] = split[1];
                }
                memo.push(val);
                return memo;
            }, [])
        .option('-l, --list-available-libraries', 'List available libraries', false)
        .option('-i, --install-library <library>', 'Install library',
            (val: string, memo: string[]) => {
                libsToInstall.push(val);
                memo.push(val);
                return memo;
            }, [])
        .parse(commandLineArguments);
    return commander;
};

if (!testMode) {
    commander = refreshCommander(process.argv);
}

export function commanderRefresher(newArguments: string[]) {
    if (testMode) {
        commandLineStore = {};
        libsToInstall = [];
        commander = refreshCommander(newArguments);
    }
}

export class CommandLineConfiguration {
    private static instance: CommandLineConfiguration;
    private commandLine: any;

    private constructor() {
        this.commandLine = commander;
    }

    private static getCommandLine(): any {
        if (!CommandLineConfiguration.instance || testMode) {
            CommandLineConfiguration.instance = new CommandLineConfiguration();
        }
        return CommandLineConfiguration.instance.commandLine;
    }

    public static isQuietMode(): boolean {
        return CommandLineConfiguration.getCommandLine().quiet;
    }

    public static getVerbosity(): string {
        return CommandLineConfiguration.getCommandLine().verbosity;
    }

    public static getConfigFileName(): string {
        const commandLine = CommandLineConfiguration.getCommandLine();
        let configFileName = commandLine.configFile;
        if (!configFileName) {
            const args = commandLine.args;
            if (args && args.length > 0) {
                configFileName = args[0];
            } else {
                configFileName = 'config.yml';
            }
        }
        return configFileName;
    }

    public static getStore(): any {
        return commandLineStore;
    }

    public static getLibrariesToInstall(): string[] {
        return libsToInstall;
    }

    public static requestToListAvailableLibraries(): boolean {
        return CommandLineConfiguration.getCommandLine().listAvailableLibraries;
    }

}
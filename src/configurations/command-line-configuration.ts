import {Command} from 'commander';
const packageJson = require('../../package.json');


let commandLineStore: any = {};
let commander: any = {};

const testMode = process.argv[1].toString().match('jest');
export function commanderRefresher(newValue: any) {
    if (testMode) {
        commander = newValue;
    }
}

if (!testMode) {
    commander = new Command()
        .version(process.env.npm_package_version || packageJson.version, '-v, --version')
        .usage('-c <confif-file-path>')
        .option('-q, --quiet', 'Disable logging', false)
        .option('-l, --log-level <level>', 'Set log level')
        .option('-c, --config-file <path>', 'Set configurationFile')
        .option('-s, --store [store]', 'Add variables values to this session',
            (val: string, memo: string[]) => {
                const split = val.split('=');
                if (split.length == 2) {
                    commandLineStore[split[0]] = split[1];
                }

                memo.push(val);
                return memo;
            },
            [])
        .parse(process.argv);
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

    public static getLogLevel(): string {
        return CommandLineConfiguration.getCommandLine().logLevel;
    }

    public static getConfigFileName(): string {
        return CommandLineConfiguration.getCommandLine().configFile;
    }

    public static getStore(): any {
        return CommandLineConfiguration.getCommandLine().commandLineStore;
    }

}
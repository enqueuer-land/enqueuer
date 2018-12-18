import {Command} from 'commander';
import {Logger} from '../loggers/logger';

const packageJson = require('../../package.json');

let commander = {};

let testMode = false;
if (process.argv.length > 1) {
    const secondArgument = process.argv[1];
    if (secondArgument) {
        testMode = !!secondArgument.toString().match('jest');
    }
}

let commandLineStore: any = {};
let singleRunFiles: string[] = [];
let singleRunFilesIgnoring: string[] = [];
let daemonTypes: string[] = [];

let refreshCommander = (commandLineArguments: string[]) => {
    try {
        return new Command()
            .version(process.env.npm_package_version || packageJson.version, '-v, --version')
            .allowUnknownOption()
            .usage('[options] <config-file-path>')
            .option('-q, --quiet', 'disable logging', false)
            .option('-b, --verbosity <level>', 'set verbosity [trace, debug, info, warn, error, fatal]')
            .option('-c, --config-file <path>', 'set configurationFile')
            .option('-o, --stdout-requisition-output', 'add stdout as requisition output', false)
            .option('-s, --store [store]', 'add variables values to this session',
                (val: string, memo: string[]) => {
                    const split = val.split('=');
                    if (split.length == 2) {
                        commandLineStore[split[0]] = split[1];
                    }
                    memo.push(val);
                    return memo;
                }, [])
            .option('-d, --daemon <type>', 'print in daemon mode with default values of <type>',
                (val: string) => daemonTypes.push(val), [])
            .option('-a, --add-file-single-run <file>', 'add file to be tested in single-run',
                (val: string) => singleRunFiles.push(val), [])
            .option('-A, --add-file-and-ignore-single-run <file>', 'add file to be tested and ignore the ones set in single-run  ',
                (val: string) => singleRunFilesIgnoring.push(val), [])
            .option('-p, --protocols-description [protocol]', 'describe protocols')
            .parse(commandLineArguments || ['path', 'enqueuer']);
    } catch (err) {
        Logger.warning(err);
        return {};
    }
};

if (!testMode) {
    commander = refreshCommander(process.argv);
}

export function commanderRefresher(newArguments: string[]) {
    if (testMode) {
        commandLineStore = {};
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

    public static getStdoutRequisitionOutput(): boolean {
        return !!CommandLineConfiguration.getCommandLine().stdoutRequisitionOutput;
    }

    public static getConfigFileName(): string | undefined {
        const commandLine = CommandLineConfiguration.getCommandLine();
        let configFileName = commandLine.configFile;
        if (configFileName) {
            return configFileName;
        }
        const args = commandLine.args;
        if (args && args.length > 0) {
            return args[0];
        }
    }

    public static getStore(): any {
        return commandLineStore;
    }

    public static describeProtocols(): string | undefined | true {
        return CommandLineConfiguration.getCommandLine().protocolsDescription;
    }

    public static singleRunFiles(): string[] {
        return singleRunFiles;
    }

    public static singleRunFilesIgnoring(): string[] {
        return singleRunFilesIgnoring;
    }

    public static getDaemonTypes(): string[]  {
        return daemonTypes;
    }
}

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
let plugins: string[] = [];
let singleRunFilesIgnoring: string[] = [];

let refreshCommander = (commandLineArguments: string[]) => {
    try {
        let commander = new Command()
            .version(process.env.npm_package_version || packageJson.version, '-v, --version')
            .allowUnknownOption()
            .usage('[options]')
            .description('Take a look at the full documentation: http://enqueuer-land.github.io/enqueuer')
            // .help('Take a look at the full documentation: http://enqueuer-land.github.io/enqueuer')
            .option('-q, --quiet', 'disable logging', false)
            .option('-b, --verbosity <level>', 'set verbosity',  /^(trace|debug|info|warn|error|fatal)$/i, 'warn')
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
            .option('-p, --protocols-description [protocol]', 'describe protocols')
            .option('-f, --formatters-description [formatter]', 'describe report formatters')
            .option('-t, --tests-list', 'list available tests assertions')
            .option('-l, --add-plugin [plugin]', 'add plugin',
                (val: string) => plugins.push(val), [])
            .option('-c, --config-file <path>', 'set configurationFile')
            .option('-a, --add-file <file>', 'add file to be tested',
                (val: string) => singleRunFiles.push(val), [])
            .option('-A, --add-file-and-ignore-others <file>', 'add file to be tested and ignore others',
                (val: string) => singleRunFilesIgnoring.push(val), []);
        commander.on('--help', () => {
            console.log('');
            console.log('Examples:');
            console.log('  $ nqr --config-file config-file.yml --verbosity error --store key=value');
            console.log('  $ enqueuer -c config-file.yml -a test-file.yml --add-file another-test-file.yml -b info');
            console.log('  $ enqueuer -a test-file.yml --store someKey=true --store someOtherKey=false');
            console.log('  $ nqr --protocols-description -s key=value');
            console.log('  $ nqr -l my-enqueuer-plugin-name -p plugin-protocol');
            console.log('  $ nqr -p http');
            console.log('  $ nqr --formatters-description json');
        });
        return commander.parse(commandLineArguments || ['path', 'enqueuer']);
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

    public static describeFormatters(): string | undefined | true {
        return CommandLineConfiguration.getCommandLine().formattersDescription;
    }

    public static describeTestsList() {
        return CommandLineConfiguration.getCommandLine().testsList;
    }

    public static singleRunFiles(): string[] {
        return singleRunFiles;
    }

    public static singleRunFilesIgnoring(): string[] {
        return singleRunFilesIgnoring;
    }

    public static getPlugins(): string[] {
        return plugins;
    }
}

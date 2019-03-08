import {Command} from 'commander';
import {Logger} from '../loggers/logger';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {TestsDescriber} from '../testers/tests-describer';

const packageJson = require('../../package.json');

export class CommandLineConfiguration {
    private parsedCommandLine: any;
    private readonly commandLineStore: any = {};
    private readonly plugins: string[] = [];
    private readonly singleRunFiles: string[] = [];
    private readonly singleRunFilesIgnoring: string[] = [];

    public constructor(commandLineArguments: string[]) {
        try {
            const commander = new Command()
                .version(process.env.npm_package_version || packageJson.version, '-v, --version')
                .allowUnknownOption()
                .usage('[options]')
                .description('Take a look at the full documentation: http://enqueuer-land.github.io/enqueuer')
                .option('-q, --quiet', 'disable logging', false)
                .option('-b, --verbosity <level>', 'set verbosity', /^(trace|debug|info|warn|error|fatal)$/i, 'warn')
                .option('-o, --stdout-requisition-output', 'add stdout as requisition output', false)
                .option('-s, --store [store]', 'add variables values to this session',
                    (val: string, memo: string[]) => this.storeCommandLineAction(val, memo), [])
                .option('-p, --protocols-description [protocol]', 'describe protocols')
                .option('-f, --formatters-description [formatter]', 'describe report formatters')
                .option('-t, --tests-list', 'list available tests assertions')
                .option('-l, --add-plugin [plugin]', 'add plugin',
                    (val: string) => this.plugins.push(val), [])
                .option('-c, --config-file <path>', 'set configurationFile')
                .option('-a, --add-file <file>', 'add file to be tested',
                    (val: string) => this.singleRunFiles.push(val), [])
                .option('-A, --add-file-and-ignore-others <file>', 'add file to be tested and ignore others',
                    (val: string) => this.singleRunFilesIgnoring.push(val), [])
                .action((parsedCommandLine) => this.verifyPrematureActions(parsedCommandLine));
            commander.on('--help', () => this.helpDescription());
            this.parsedCommandLine = commander.parse(commandLineArguments || ['path', 'enqueuer']);
        } catch (err) {
            Logger.warning(err);
        }
    }

    public isQuietMode(): boolean {
        return this.parsedCommandLine.quiet;
    }

    public getVerbosity(): string {
        return this.parsedCommandLine.verbosity;
    }

    public getStdoutRequisitionOutput(): boolean {
        return !!this.parsedCommandLine.stdoutRequisitionOutput;
    }

    public getConfigFileName(): string | undefined {
        let configFileName = this.parsedCommandLine.configFile;
        if (configFileName) {
            return configFileName;
        }
        const args = this.parsedCommandLine.args;
        if (args && args.length > 0) {
            return args[0];
        }
    }

    public getStore(): any {
        return this.commandLineStore;
    }

    public getSingleRunFiles(): string[] {
        return this.singleRunFiles;
    }

    public getSingleRunFilesIgnoring(): string[] {
        return this.singleRunFilesIgnoring;
    }

    public getPlugins(): string[] {
        return this.plugins;
    }

    public getVersion(): string {
        return this.parsedCommandLine._version;
    }

    private storeCommandLineAction(val: string, memo: string[]) {
        const split = val.split('=');
        if (split.length == 2) {
            this.commandLineStore[split[0]] = split[1];
        }
        memo.push(val);
        return memo;
    }

    private helpDescription(): void {
        console.log('');
        console.log('Examples:');
        console.log('  $ nqr --config-file config-file.yml --verbosity error --store key=value');
        console.log('  $ enqueuer -c config-file.yml -a test-file.yml --add-file another-test-file.yml -b info');
        console.log('  $ enqueuer -a test-file.yml --store someKey=true --store someOtherKey=false');
        console.log('  $ nqr --protocols-description -s key=value');
        console.log('  $ nqr -l my-enqueuer-plugin-name -p plugin-protocol');
        console.log('  $ nqr -p http');
        console.log('  $ nqr --formatters-description json');
    }

    //TODO test it
    private verifyPrematureActions(parsedCommandLine: any): void {
        let exitCode;
        if (parsedCommandLine.protocolsDescription) {
            exitCode = DynamicModulesManager.getInstance().getProtocolManager()
                .describeProtocols(parsedCommandLine.protocolsDescription) ? 0 : 1;
        } else if (parsedCommandLine.formattersDescription) {
            exitCode = DynamicModulesManager.getInstance().getReportFormatterManager()
                .describeReportFormatters(parsedCommandLine.formattersDescription) ? 0 : 1;
        } else if (parsedCommandLine.testsList) {
            new TestsDescriber().describeTests();
            exitCode = 0;
        }
        if (exitCode !== undefined) {
            process.exit(exitCode);
        }
    }

}

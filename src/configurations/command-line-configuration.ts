import {Command} from 'commander';
import {Logger} from '../loggers/logger';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {TestsDescriber} from '../testers/tests-describer';

const packageJson = require('../../package.json');

export class CommandLineConfiguration {
    private parsedCommandLine: any;
    private readonly commandLineStore: any = {};
    private readonly plugins: string[] = [];
    private readonly testFiles: string[] = [];
    private readonly testFilesIgnoringOthers: string[] = [];

    public constructor(commandLineArguments: string[]) {
        try {
            const commander = new Command()
                .version(process.env.npm_package_version || packageJson.version, '-v, --version')
                .allowUnknownOption()
                .usage('[options] test-file1 test-file2')
                .description('Take a look at the full documentation: http://enqueuer-land.github.io/enqueuer')
                .option('-b, --verbosity <level>', 'set verbosity', /^(trace|debug|info|warn|error|fatal)$/i, 'warn')
                .option('-c, --config-file <path>', 'set configurationFile')
                .option('-e, --parsers-list [parser]', 'list available object parsers')
                .option('-f, --formatters-description [formatter]', 'describe report formatters')
                .option('-o, --stdout-requisition-output', 'add stdout as requisition output', false)
                .option('-p, --protocols-description [protocol]', 'describe protocols')
                .option('-q, --quiet', 'disable logging', false)
                .option('-t, --tests-list', 'list available tests assertions')
                .option('-s, --store [store]', 'add variables values to this session',
                    (val: string, memo: string[]) => this.storeCommandLineAction(val, memo), [])
                .option('-l, --add-plugin [plugin]', 'add plugin',
                    (val: string) => this.plugins.push(val), [])
                .option('-a, --add-file <file>', 'add file to be tested',
                    (val: string) => this.testFiles.push(val), [])
                .option('-A, --add-file-and-ignore-others <file>', 'add file to be tested and ignore others',
                    (val: string) => this.testFilesIgnoringOthers.push(val), []);
            commander.on('--help', () => this.helpDescription());
            this.parsedCommandLine = commander.parse(commandLineArguments || ['path', 'enqueuer']);
        } catch (err) {
            Logger.warning(err);
        }
    }

    public verifyPrematureActions(): void {
        let exitCode;
        if (this.parsedCommandLine.protocolsDescription) {
            exitCode = DynamicModulesManager.getInstance().getProtocolManager()
                .describeProtocols(this.parsedCommandLine.protocolsDescription) ? 0 : 1;
        } else if (this.parsedCommandLine.formattersDescription) {
            exitCode = DynamicModulesManager.getInstance().getReportFormatterManager()
                .describeReportFormatters(this.parsedCommandLine.formattersDescription) ? 0 : 1;
        } else if (this.parsedCommandLine.parsersList) {
            exitCode = DynamicModulesManager.getInstance().getObjectParserManager()
                .describeObjectParsers(this.parsedCommandLine.parsersList) ? 0 : 1;
        } else if (this.parsedCommandLine.testsList) {
            new TestsDescriber().describeTests();
            exitCode = 0;
        }

        if (exitCode !== undefined) {
            process.exit(exitCode);
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
        return this.parsedCommandLine.configFile;
    }

    public getStore(): any {
        return this.commandLineStore;
    }

    public getTestFiles(): string[] {
        const testFiles = this.testFiles;
        if (testFiles.length > 0) {
            return testFiles;
        }
        const args = this.parsedCommandLine.args;
        if (args && args.length > 0) {
            return args;
        }
        return [];
    }

    public getTestFilesIgnoringOthers(): string[] {
        return this.testFilesIgnoringOthers;
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
        console.log('  $ enqueuer -c config-file.yml test-file.yml --add-file another-test-file.yml -b info');
        console.log('  $ enqueuer test-file.yml --store someKey=true --store someOtherKey=false');
        console.log('  $ nqr --protocols-description -s key=value');
        console.log('  $ nqr -l my-enqueuer-plugin-name -p plugin-protocol');
        console.log('  $ nqr -p http');
        console.log('  $ nqr --formatters-description json');
    }

}

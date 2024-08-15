import { Command, Option } from 'commander';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import { Logger } from '../loggers/logger';

const packageJson = require('../../package.json');

export class CommandLineConfiguration {
    private parsedCommandLine: any;
    private readonly commandLineStore: any = {};
    private readonly plugins: string[] = [];
    private readonly testFiles: string[] = [];
    private readonly testFilesIgnoringOthers: string[] = [];

    public constructor(commandLineArguments: string[]) {
        const commander = new Command()
            .version(process.env.npm_package_version || packageJson.version, '-v, --version')
            .allowUnknownOption()
            .usage('[options] <test-file> [other-test-files...]')
            .description('Take a look at the full documentation: https://enqueuer.com')
            .addOption(new Option('-b, --verbosity <level>', 'set verbosity').choices(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('warn'))
            .option('-c, --config-file <path>', 'set configurationFile')
            .option('-d, --show-explicit-tests-only', 'show explicit tests only', false)
            .option('-e, --parsers-list [parser]', 'list available object parsers')
            .option('-f, --formatters-description [formatter]', 'describe report formatters')
            .option('-o, --stdout-requisition-output', 'add stdout as requisition output', false)
            .option('-m, --max-report-level-print <level>', 'set max report level print', parseInt)
            .option('-p, --protocols-description [protocol]', 'describe protocols')
            .option('-t, --tests-list [expectedField]', 'list available tests assertions')
            .option('-u, --loaded-modules-list', 'list loaded modules')
            .option('-i, --show-passing-tests', 'show passing tests')
            .option('-A, --add-file-and-ignore-others <file>', 'add file to be tested and ignore others',
                (val: string) => {
                    this.testFilesIgnoringOthers.push(val);
                    return val
                })
            .option('-s, --store [store]', 'add variables values to this session',
                (val: string, memo: string[]) => this.storeCommandLineAction(val, memo), [])
            .option('-l, --add-plugin [plugin]', 'add plugin',
                (val: string) => {
                    this.plugins.push(val);
                    return val
                })
            .argument('<test-file>', 'file to be tested')
            .argument('[other-test-files]', 'other files to be tested')
            .action((testFile, otherTestFiles) => {
                this.testFiles.push(testFile, ...otherTestFiles || [])
            })
        commander.on('--help', () => this.helpDescription());
        try {
            this.parsedCommandLine = commander.parse(commandLineArguments || ['path', 'enqueuer']);
            const options = commander.opts();

        } catch (err) {
            Logger.error(`Error parsing command line: ${err}`);
            this.parsedCommandLine = {};
        }

    }

    public verifyPrematureActions(): void {
        let exitCode: boolean | undefined;
        if (this.parsedCommandLine.protocolsDescription) {
            const protocolsMatcherArg = typeof this.parsedCommandLine.protocolsDescription === 'string' ?
                this.parsedCommandLine.protocolsDescription :
                undefined;
            exitCode = DynamicModulesManager.getInstance().getProtocolManager()
                .describeMatchingProtocols(protocolsMatcherArg);
        } else if (this.parsedCommandLine.formattersDescription) {
            exitCode = DynamicModulesManager.getInstance().getReportFormatterManager()
                .describeMatchingReportFormatters(this.parsedCommandLine.formattersDescription);
        } else if (this.parsedCommandLine.parsersList) {
            exitCode = DynamicModulesManager.getInstance().getObjectParserManager()
                .describeMatchingObjectParsers(this.parsedCommandLine.parsersList);
        } else if (this.parsedCommandLine.testsList) {
            exitCode = DynamicModulesManager.getInstance().getAsserterManager()
                .describeMatchingAsserters(this.parsedCommandLine.testsList);
        } else if (this.parsedCommandLine.loadedModulesList) {
            DynamicModulesManager.getInstance().describeLoadedModules();
            exitCode = true;
        }

        if (exitCode !== undefined) {
            process.exit(exitCode ? 0 : 1);
        }
    }

    public getVerbosity(): string {
        return this.parsedCommandLine.verbosity;
    }

    public getStdoutRequisitionOutput(): boolean {
        return !!this.parsedCommandLine.stdoutRequisitionOutput;
    }

    public getShowExplicitTestsOnly(): boolean {
        return !!this.parsedCommandLine.showExplicitTestsOnly;
    }

    public getConfigFileName(): string | undefined {
        return this.parsedCommandLine.configFile;
    }

    public getShowPassingTests(): boolean {
        return this.parsedCommandLine.showPassingTests;
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

    public getMaxReportLevelPrint(): number | undefined {
        return this.parsedCommandLine.maxReportLevelPrint;
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
        console.log('  $ nqr -t expect');
        console.log('  $ nqr -l my-enqueuer-plugin-name -p plugin-protocol');
        console.log('  $ nqr -p http');
        console.log('  $ nqr --formatters-description json');

        console.log('');
        console.log('Contributing:');
        console.log('  https://github.com/enqueuer-land/enqueuer');

    }

}

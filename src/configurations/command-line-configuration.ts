import { Command, Option } from 'commander';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import { Logger } from '../loggers/logger';

const packageJson = require('../../package.json');

export class CommandLineConfiguration {
    private options: any;
    private readonly commandLineStore: any = {};
    private readonly plugins: string[] = [];
    private readonly testFiles: string[] = [];

    public constructor(commandLineArguments: string[]) {
        const commander = new Command()
            .version(
                process.env.npm_package_version || packageJson.version,
                '-v, --version',
                'output the current version'
            )
            .allowUnknownOption()
            .usage('[options] [test-files...]')
            .description('Take a look at the full documentation: https://enqueuer.com')
            .addOption(
                new Option('-b, --verbosity <level>', 'set verbosity')
                    .choices(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
                    .default('warn')
            )
            .option('-c, --config-file <path>', 'set configurationFile')
            .option('-d, --show-explicit-tests-only', 'show explicit tests only', false)
            .option('-o, --stdout-requisition-output', 'add stdout as requisition output', false)
            .option('-m, --max-report-level-print <level>', 'set max report level print', parseInt)
            .option('-i, --show-passing-tests', 'show passing tests')
            .option(
                '-s, --store [store]',
                'add variables values to this session',
                (val: string, memo: string[]) => this.storeCommandLineAction(val, memo),
                []
            )
            .option('-l, --add-plugin [plugin]', 'add plugin', (val: string) => {
                this.plugins.push(val);
                return val;
            })
            .option('-e, --parsers-list [parser]', 'list available object parsers')
            .option('-f, --formatters-description [formatter]', 'describe report formatters', false)
            .option('-p, --protocols-description [protocol]', 'describe protocols', false)
            .option('-t, --tests-list [expectedField]', 'list available tests assertions', false)
            .option('-u, --loaded-modules-list', 'list loaded modules', false)
            // .argument('<test-file>', 'file to be tested')
            .argument('[test-files...]', 'other files to be tested')
            .action((testFiles: string[]) => {
                this.testFiles.push(...(testFiles || []));
            });

        commander.on('--help', () => this.helpDescription());
        try {
            commander.parse(commandLineArguments || ['path', 'enqueuer']);
            this.options = commander.opts();
        } catch (err) {
            Logger.error(`Error parsing command line: ${err}`);
            this.options = {};
        }
    }

    public verifyPrematureActions(): void {
        let exitCode: boolean | undefined;
        if (this.options.protocolsDescription) {
            const protocolsMatcherArg =
                typeof this.options.protocolsDescription === 'string' ? this.options.protocolsDescription : undefined;
            exitCode = DynamicModulesManager.getInstance()
                .getProtocolManager()
                .describeMatchingProtocols(protocolsMatcherArg);
        } else if (this.options.formattersDescription) {
            exitCode = DynamicModulesManager.getInstance()
                .getReportFormatterManager()
                .describeMatchingReportFormatters(this.options.formattersDescription);
        } else if (this.options.parsersList) {
            exitCode = DynamicModulesManager.getInstance()
                .getObjectParserManager()
                .describeMatchingObjectParsers(this.options.parsersList);
        } else if (this.options.testsList) {
            exitCode = DynamicModulesManager.getInstance()
                .getAsserterManager()
                .describeMatchingAsserters(this.options.testsList);
        } else if (this.options.loadedModulesList) {
            DynamicModulesManager.getInstance().describeLoadedModules();
            exitCode = true;
        }

        if (exitCode !== undefined) {
            process.exit(exitCode ? 0 : 1);
        }
    }

    public getVerbosity(): string {
        return this.options.verbosity;
    }

    public getStdoutRequisitionOutput(): boolean {
        return !!this.options.stdoutRequisitionOutput;
    }

    public getShowExplicitTestsOnly(): boolean {
        return !!this.options.showExplicitTestsOnly;
    }

    public getConfigFileName(): string | undefined {
        return this.options.configFile;
    }

    public getShowPassingTests(): boolean {
        return this.options.showPassingTests;
    }

    public getStore(): any {
        return this.commandLineStore;
    }

    public getTestFiles(): string[] {
        const testFiles = this.testFiles;
        if (testFiles.length > 0) {
            return testFiles;
        }
        const args = this.options.args;
        if (args && args.length > 0) {
            return args;
        }
        return [];
    }

    public getPlugins(): string[] {
        return this.plugins;
    }

    public getMaxReportLevelPrint(): number | undefined {
        return this.options.maxReportLevelPrint;
    }

    public getVersion(): string {
        return process.env.npm_package_version || packageJson.version;
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
        console.log('  $ enqueuer -c config-file.yml test-file.yml another-test-file.yml -b info');
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

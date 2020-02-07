import {CommandLineConfiguration} from './command-line-configuration';
import {FileConfiguration} from './file-configuration';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {LogLevel} from '../loggers/log-level';
import {prettifyJson} from '../outputs/prettify-json';

// process.setMaxListeners(30);

export class Configuration {
    private static instance: Configuration;
    private static loaded: boolean = false;

    private parallel: boolean = false;
    private files: string[] = [];
    private logLevel: string = 'warn';
    private outputs: PublisherModel[] = [];
    private maxReportLevelPrint: number = 1;
    private store: any = {};
    private plugins: string[] = [];
    private commandLineConfiguration: CommandLineConfiguration;
    private showPassingTests: boolean = false;

    private constructor() {
        this.commandLineConfiguration = new CommandLineConfiguration(process.argv);
        const fileName = this.commandLineConfiguration.getConfigFileName();
        this.adjustFromFile(fileName);
        this.adjustFromCommandLine();
    }

    public static getInstance(): Configuration {
        if (Configuration.loaded === false) {
            Configuration.loaded = true;
            Configuration.instance = new Configuration();
            Logger.setLoggerLevel(LogLevel.buildFromString(Configuration.instance.getLogLevel()));
            Configuration.instance.commandLineConfiguration.verifyPrematureActions();
            if (Configuration.instance.logLevel === 'trace') {
                this.printConfiguration();
            }
        }
        return Configuration.instance;
    }

    public getValues(): Configuration {
        const copy = Object.assign({}, Configuration.instance);
        delete copy.commandLineConfiguration;
        return copy;
    }

    public addPlugin(pluginName: string): boolean {
        Logger.info(`Plugin added to the list: ${pluginName}`);
        const plugins: Set<string> = new Set(this.plugins);
        plugins.add(pluginName);
        this.plugins = Array.from(plugins.values());
        return DynamicModulesManager.getInstance().loadModuleExplicitly(pluginName);
    }

    public isParallel(): boolean {
        return this.parallel;
    }

    public getShowPassingTests(): boolean {
        return this.showPassingTests;
    }

    public addFiles(...files: string[]): void {
        this.files = this.files.concat(files);
    }

    public getFiles(): string[] {
        return this.files;
    }

    public getLogLevel(): string {
        return this.logLevel;
    }

    public getOutputs(): PublisherModel[] {
        return this.outputs;
    }

    public setMaxReportLevelPrint(level: number) {
        this.maxReportLevelPrint = level;
    }

    public getMaxReportLevelPrint(): number {
        return this.maxReportLevelPrint;
    }

    public getStore(): any {
        return this.store;
    }

    public getPlugins(): string[] {
        return this.plugins;
    }

    public addPlugins(...plugins: string[]): void {
        this.plugins = this.plugins.concat(plugins);
    }

    private adjustFromCommandLine(): void {
        this.files = this.files.concat(this.commandLineConfiguration.getTestFiles() || []);

        this.logLevel = this.commandLineConfiguration.getVerbosity() || this.logLevel;
        this.plugins = [...new Set(this.plugins.concat(this.commandLineConfiguration.getPlugins() || []))];
        this.store = Object.assign({}, this.store, this.commandLineConfiguration.getStore());
        this.showPassingTests = this.commandLineConfiguration.getShowPassingTests();
        const filesIgnoringOthers = this.commandLineConfiguration.getTestFilesIgnoringOthers();
        if (filesIgnoringOthers && filesIgnoringOthers.length > 0) {
            this.files = filesIgnoringOthers;
        }
        if (this.commandLineConfiguration.getStdoutRequisitionOutput()) {
            this.outputs.push({type: 'standard-output', format: 'console', name: 'command line report output'});
        }
        const fileMaxReportLevelPrint = this.commandLineConfiguration.getMaxReportLevelPrint();
        if (fileMaxReportLevelPrint !== undefined) {
            this.maxReportLevelPrint = fileMaxReportLevelPrint;
        }

    }

    private adjustFromFile(filename?: string) {
        if (filename !== undefined) {
            try {
                const fileConfiguration = new FileConfiguration(filename);
                if (fileConfiguration) {
                    this.parallel = fileConfiguration.isParallelExecution() || this.parallel;
                    this.logLevel = fileConfiguration.getLogLevel() || this.logLevel;
                    this.files = this.files.concat(fileConfiguration.getFiles());
                    this.outputs = this.outputs.concat(fileConfiguration.getOutputs());
                    this.plugins = this.plugins.concat(fileConfiguration.getPlugins());
                    this.store = Object.assign({}, fileConfiguration.getStore(), this.store);
                    const fileMaxReportLevelPrint = fileConfiguration.getMaxReportLevelPrint();
                    if (fileMaxReportLevelPrint !== undefined) {
                        this.maxReportLevelPrint = fileMaxReportLevelPrint;
                    }
                }
            } catch (err) {
                Logger.error(err);
            }
        }
    }

    private static printConfiguration() {
        console.log(prettifyJson({configuration: this.getInstance().getValues()}));
    }

}

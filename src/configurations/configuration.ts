import {CommandLineConfiguration} from './command-line-configuration';
import {FileConfiguration} from './file-configuration';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Logger} from '../loggers/logger';
import prettyjson from 'prettyjson';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';

export class Configuration {
    private static instance: Configuration;
    private static loaded: boolean = false;

    private name: string = 'enqueuer';
    private parallel: boolean = false;
    private files: string[] = [];
    private logLevel: string = 'warn';
    private outputs: PublisherModel[] = [];
    private maxReportLevelPrint: number = 2;
    private store: any = {};
    private quiet: boolean = false;
    private plugins: string[] = [];

    private constructor() {
        const commandLineConfiguration = new CommandLineConfiguration(process.argv);
        const fileName = commandLineConfiguration.getConfigFileName();
        this.adjustFromFile(fileName);
        this.adjustFromCommandLine(commandLineConfiguration);
    }

    public static getInstance(): Configuration {
        if (Configuration.loaded === false) {
            Configuration.loaded = true;
            Configuration.instance = new Configuration();
            if (Configuration.instance.logLevel === 'trace') {
                console.log(prettyjson.render({configuration: Configuration.instance}, getPrettyJsonConfig()));
            }
        }
        return Configuration.instance;
    }

    public addPlugin(pluginName: string): Configuration {
        Logger.info(`Plugin added to the list: ${pluginName}`);
        const plugins: Set<string> = new Set(this.plugins);
        plugins.add(pluginName);
        this.plugins = Array.from(plugins.values());
        return this;
    }

    public getName(): string {
        return this.name;
    }

    public isParallel(): boolean {
        return this.parallel;
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

    public getMaxReportLevelPrint(): number {
        return this.maxReportLevelPrint;
    }

    public getStore(): any {
        return this.store;
    }

    public isQuiet(): boolean {
        return this.quiet;
    }

    public getPlugins(): string[] {
        return this.plugins;
    }

    private adjustFromCommandLine(commandLineConfiguration: CommandLineConfiguration): void {
        this.files = this.files.concat(commandLineConfiguration.getSingleRunFiles() || []);

        this.logLevel = commandLineConfiguration.getVerbosity() || this.logLevel;
        this.plugins = [...new Set(this.plugins.concat(commandLineConfiguration.getPlugins() || []))];
        this.store = Object.assign({}, this.store, commandLineConfiguration.getStore());
        this.quiet = commandLineConfiguration.isQuietMode();
        const singleRunFilesIgnoring = commandLineConfiguration.getSingleRunFilesIgnoring();
        if (singleRunFilesIgnoring && singleRunFilesIgnoring.length > 0) {
            this.files = singleRunFilesIgnoring;
        }
        if (commandLineConfiguration.getStdoutRequisitionOutput() !== false) {
            this.outputs.push({type: 'standard-output', format: 'console', name: 'command line report output'});
        }
    }

    private adjustFromFile(filename?: string) {
        if (filename !== undefined) {
            try {
                const fileConfiguration = new FileConfiguration(filename);
                if (fileConfiguration) {
                    this.name = fileConfiguration.getName() || this.name;
                    this.parallel = !!fileConfiguration.isParallelExecution() || this.parallel;
                    this.files = fileConfiguration.getFiles() || this.files;
                    this.logLevel = fileConfiguration.getLogLevel() || this.logLevel;
                    this.outputs = this.outputs.concat(fileConfiguration.getOutputs() || []);
                    this.plugins = this.plugins.concat(fileConfiguration.getPlugins() || []);
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

}

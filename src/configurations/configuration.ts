import {CommandLineConfiguration} from './command-line-configuration';
import {FileConfiguration} from './file-configuration';
import {ConfigurationValues} from './configuration-values';

export class Configuration {

    private static configFileName?: string;
    private static instance: any;

    private constructor() {

    }

    public static getValues(): ConfigurationValues {
        const configFileName = CommandLineConfiguration.getConfigFileName();
        const isNotLoadedYet = !Configuration.instance;
        const fileNameHasChanged = configFileName != Configuration.configFileName;

        if (isNotLoadedYet) {
            Configuration.instance = this.initialLoad();
        }
        if (configFileName !== undefined && fileNameHasChanged) {
            Configuration.instance = this.readFromFile(configFileName);
        }
        return {...Configuration.instance} as ConfigurationValues;
    }

    public static addPlugin(pluginName: string): ConfigurationValues {
        Configuration.getValues();
        const plugins: Set<string> = new Set(Configuration.instance.plugins);
        plugins.add(pluginName);
        Configuration.instance.plugins = Array.from(plugins.values());
        return this.getValues();
    }

    private static initialLoad() {
        return Configuration.createDefaultSingleRun();
    }

    private static readFromFile(configFileName: string): ConfigurationValues {
        const defaultValues = Configuration.createDefaultSingleRun();
        FileConfiguration.load(configFileName);
        Configuration.configFileName = configFileName;
        return {
            name: FileConfiguration.getName(),
            parallel: !!FileConfiguration.isParallelExecution(),
            files: FileConfiguration.getFiles() || [],
            logLevel: CommandLineConfiguration.getVerbosity() || FileConfiguration.getLogLevel() || defaultValues.logLevel,
            outputs: defaultValues.outputs.concat(FileConfiguration.getOutputs() || []),
            plugins: defaultValues.plugins.concat(FileConfiguration.getPlugins() || []),
            store: Object.assign({}, FileConfiguration.getStore(), CommandLineConfiguration.getStore()),
            maxReportLevelPrint: FileConfiguration.getMaxReportLevelPrint() || defaultValues.maxReportLevelPrint,
            quiet: CommandLineConfiguration.isQuietMode(),
            addSingleRun: CommandLineConfiguration.singleRunFiles(),
            addSingleRunIgnore: CommandLineConfiguration.singleRunFilesIgnoring()
        };
    }

    private static createDefaultSingleRun(): any {
        let outputs = [];
        if (CommandLineConfiguration.getStdoutRequisitionOutput()) {
            outputs.push({type: 'standard-output', format: 'console'});
        }
        return {
            logLevel: CommandLineConfiguration.getVerbosity() || 'warn',
            name: '',
            parallel: false,
            maxReportLevelPrint: 2,
            files: [],
            outputs: outputs,
            store: Object.assign({}, CommandLineConfiguration.getStore()),
            quiet: CommandLineConfiguration.isQuietMode(),
            plugins: CommandLineConfiguration.getPlugins() || [],
            addSingleRun: CommandLineConfiguration.singleRunFiles(),
            addSingleRunIgnore: CommandLineConfiguration.singleRunFilesIgnoring()
        };
    }
}

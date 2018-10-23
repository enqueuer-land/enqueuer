import {CommandLineConfiguration} from './command-line-configuration';
import {FileConfiguration} from './file-configuration';
import {ConfigurationValues, DaemonMode, SingleRunMode} from './configuration-values';

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
            const daemonTypes = CommandLineConfiguration.getDaemonTypes();
            if (daemonTypes.length > 0) {
                Configuration.instance = Configuration.createDefaultDaemon(daemonTypes);
            } else {
                Configuration.instance = Configuration.createDefaultSingleRun();
            }
        }
        if (configFileName !== undefined && fileNameHasChanged) {
            Configuration.instance = this.readFromFile(configFileName);
        }
        return {...Configuration.instance} as ConfigurationValues;
    }

    private static readFromFile(configFileName: string): any {
        const defaultValues = Configuration.createDefaultSingleRun();
        FileConfiguration.load(configFileName);
        Configuration.configFileName = configFileName;
        return {
            logLevel: CommandLineConfiguration.getVerbosity() || FileConfiguration.getLogLevel() || defaultValues.logLevel,
            daemon: FileConfiguration.getDaemon(),
            'single-run': FileConfiguration.getSingleRun() || defaultValues.singleRun,
            outputs: defaultValues.outputs.concat(FileConfiguration.getOutputs() || []),
            store: Object.assign({}, FileConfiguration.getStore(), CommandLineConfiguration.getStore()),
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
            'single-run': {
                files: []
            },
            outputs: outputs,
            store: Object.assign({}, CommandLineConfiguration.getStore()),
            quiet: CommandLineConfiguration.isQuietMode(),
            addSingleRun: CommandLineConfiguration.singleRunFiles(),
            addSingleRunIgnore: CommandLineConfiguration.singleRunFilesIgnoring()
        };
    }

    private static createDefaultDaemon(daemonTypes: string[]): any {
        let outputs = [];
        if (CommandLineConfiguration.getStdoutRequisitionOutput()) {
            outputs.push({type: 'standard-output', format: 'console'});
        }
        return {
            logLevel: CommandLineConfiguration.getVerbosity() || 'warn',
            daemon: daemonTypes.map((daemonType: string) => {
                return {type: daemonType};
            }),
            outputs: outputs,
            store: Object.assign({}, CommandLineConfiguration.getStore()),
            quiet: CommandLineConfiguration.isQuietMode(),
            addSingleRun: CommandLineConfiguration.singleRunFiles(),
            addSingleRunIgnore: CommandLineConfiguration.singleRunFilesIgnoring()
        };
    }
}

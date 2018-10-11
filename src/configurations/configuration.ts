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
        if (!Configuration.instance || configFileName != Configuration.configFileName) {
            FileConfiguration.reload(configFileName);
            Configuration.instance = {
                logLevel: CommandLineConfiguration.getVerbosity() || FileConfiguration.getLogLevel() || 'warn',
                runMode: FileConfiguration.getRunMode(),
                daemon: FileConfiguration.getDaemon(),
                'single-run': FileConfiguration.getSingleRun(),
                outputs: FileConfiguration.getOutputs(),
                store: Object.assign({}, FileConfiguration.getStore(), CommandLineConfiguration.getStore()),
                quiet: CommandLineConfiguration.isQuietMode(),
                addSingleRun: CommandLineConfiguration.singleRunFiles(),
                addSingleRunIgnore: CommandLineConfiguration.singleRunFilesIgnoring()
            };
        }
        Configuration.configFileName = configFileName;
        return {...Configuration.instance} as ConfigurationValues;
    }

}

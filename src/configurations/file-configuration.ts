import {PublisherModel} from '../models/inputs/publisher-model';
import * as yaml from 'yamljs';
import {Logger} from '../loggers/logger';

export class FileConfiguration {
    private static DEFAULT_FILENAME = 'enqueuer.yml';
    private static instance: any;

    private configurationFile: any;

    private constructor(filename: string) {
        this.configurationFile = yaml.load(filename);
    }

    public static reload(filename: string): boolean {
        try {
            FileConfiguration.instance = new FileConfiguration(filename);
            return true;
        } catch (err) {
            FileConfiguration.instance = {
                configurationFile: {}
            };
            Logger.error(`Error loading configuration file '${filename}': ${err}`);
        }
        return false;
    }

    public static getLogLevel(): string {
        return FileConfiguration.getConfigurationFile()['log-level'];
    }

    public static getRunMode(): any {
        return FileConfiguration.getConfigurationFile()['run-mode'];
    }

    public static getOutputs(): PublisherModel[] {
        return FileConfiguration.getConfigurationFile().outputs || [];
    }

    public static getStore(): any {
        return FileConfiguration.getConfigurationFile().store || {};
    }

    private static getConfigurationFile(): any {
        if (!FileConfiguration.instance) {
            FileConfiguration.reload(FileConfiguration.DEFAULT_FILENAME);
        }
        return FileConfiguration.instance.configurationFile;
    }
}
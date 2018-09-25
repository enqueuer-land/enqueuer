import {PublisherModel} from '../models/inputs/publisher-model';
import {YamlObjectNotation} from '../object-notations/yaml-object-notation';

export class FileConfiguration {
    private static DEFAULT_FILENAME = 'enqueuer.yml';
    private static instance: any;

    private configurationFile: any;

    private constructor(filename: string) {
        this.configurationFile = new YamlObjectNotation().loadFromFileSync(filename);
    }

    public static reload(filename: string) {
        try {
            FileConfiguration.instance = new FileConfiguration(filename);
        } catch (err) {
            throw (`Error loading configuration file: ${err}`);
        }
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
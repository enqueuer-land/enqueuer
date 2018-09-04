import {PublisherModel} from '../models/inputs/publisher-model';
import {CommandLineConfiguration} from './command-line-configuration';
import {FileConfiguration} from './file-configuration';

export class Configuration {

    private static configFileName: string;

    private refresh() {
        const configFileName = CommandLineConfiguration.getConfigFileName();
        if (configFileName != Configuration.configFileName) {
            FileConfiguration.reload(configFileName);
            Configuration.configFileName = configFileName;
        }
    }

    public getLogLevel(): string {
        this.refresh();
        return CommandLineConfiguration.getLogLevel() ||
                FileConfiguration.getLogLevel() ||
                'warn';
    }

    public getRunMode(): any {
        this.refresh();
        return FileConfiguration.getRunMode();
    }

    public getOutputs(): PublisherModel[] {
        this.refresh();
        return FileConfiguration.getOutputs();
    }

    public getStore(): any {
        this.refresh();
        return Object.assign({},
                                FileConfiguration.getStore(),
                                CommandLineConfiguration.getStore());
    }

    public isQuietMode(): any {
        return CommandLineConfiguration.isQuietMode();
    }

}

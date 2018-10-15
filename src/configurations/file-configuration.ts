import {PublisherModel} from '../models/inputs/publisher-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';
import {DaemonMode, SingleRunMode} from './configuration-values';

export class FileConfiguration {
    private static instance: any;

    private constructor() {
        /* do nothing */
    }

    public static load(filename: string): void {
        try {
            FileConfiguration.instance = new MultipleObjectNotation().loadFromFileSync(filename);
        } catch (err) {
            throw (`Error loading configuration file: ${err}`);
        }
    }

    public static getLogLevel(): string {
        return FileConfiguration.instance['log-level'];
    }

    public static getDaemon(): DaemonMode {
        const runMode = FileConfiguration.instance['run-mode'];
        if (runMode) {
            return runMode.daemon;
        }
        return FileConfiguration.instance['daemon'];
    }

    public static getSingleRun(): SingleRunMode {
        const runMode = FileConfiguration.instance['run-mode'];
        if (runMode) {
            return runMode['single-run'];
        }
        return FileConfiguration.instance['single-run'];
    }

    public static getOutputs(): PublisherModel[] {
        return FileConfiguration.instance.outputs;
    }

    public static getStore(): any {
        return FileConfiguration.instance.store;
    }
}

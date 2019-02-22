import {PublisherModel} from '../models/inputs/publisher-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';

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

    public static getOutputs(): PublisherModel[] {
        return FileConfiguration.instance.outputs;
    }

    public static getStore(): any {
        return FileConfiguration.instance.store;
    }

    static getPlugins(): string[] {
        return FileConfiguration.instance.plugins;
    }

    public static getName() {
        return FileConfiguration.instance.name;
    }

    static isParallelExecution() {
        return FileConfiguration.instance.parallel;
    }

    static getFiles() {
        return FileConfiguration.instance.files;
    }
}

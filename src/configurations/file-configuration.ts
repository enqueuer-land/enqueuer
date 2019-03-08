import {PublisherModel} from '../models/inputs/publisher-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';

export class FileConfiguration {
    private readonly parsedFile: any;

    public constructor(filename: string) {
        try {
            this.parsedFile = new MultipleObjectNotation().loadFromFileSync(filename);
        } catch (err) {
            throw (`Error loading configuration file: ${err}`);
        }
    }

    public getLogLevel(): string {
        return this.parsedFile['log-level'];
    }

    public getOutputs(): PublisherModel[] {
        return this.parsedFile.outputs;
    }

    public getStore(): any {
        return this.parsedFile.store;
    }

    public getPlugins(): string[] {
        return this.parsedFile.plugins;
    }

    public getName() {
        return this.parsedFile.name;
    }

    public isParallelExecution() {
        return this.parsedFile.parallel;
    }

    public getFiles() {
        return this.parsedFile.files;
    }

    public getMaxReportLevelPrint() {
        return this.parsedFile.maxReportLevelPrint;
    }
}

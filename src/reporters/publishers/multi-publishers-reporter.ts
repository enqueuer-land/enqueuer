import {PublisherReporter} from './publisher-reporter';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';

export class MultiPublishersReporter {
    private publishers: PublisherReporter[];

    constructor(publishers: input.PublisherModel[] = []) {
        Logger.debug(`Instantiating publishers`);
        this.publishers = publishers.map((publisher, index) => {
            if (!publisher.name) {
                publisher.name = `Publisher #${index}`;
            }
            return new PublisherReporter(publisher);
        });
    }

    public publish(): Promise<void[]> {
        Logger.debug(`Publishing publishers`);
        return Promise.all(this.publishers.map(publisher => publisher.publish()));
    }

    public onFinish(): void {
        //sync forEach
        this.publishers.map(publisher => publisher.onFinish());
    }

    public getReport(): output.PublisherModel[] {
        return this.publishers.map(publisher => publisher.getReport());
    }

}
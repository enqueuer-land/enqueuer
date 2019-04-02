import {PublisherReporter} from './publisher-reporter';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import {Logger} from '../../loggers/logger';

export class MultiPublishersReporter {
    private publishers: PublisherReporter[];

    constructor(publishers: input.PublisherModel[]) {
        Logger.debug(`Instantiating publishers`);
        this.publishers = publishers.map((publisher) => new PublisherReporter(publisher));
    }

    public async publish(): Promise<number> {
        let errorsCounter = 0;
        if (this.publishers.length > 0) {
            Logger.info(`Publishers are publishing messages`);

            await Promise.all(this.publishers.map(async publisher => {
                try {
                    await publisher.publish();
                } catch (err) {
                    ++errorsCounter;
                    Logger.error(err);
                }
            }));
            Logger.info(`Publishers have published their messages`);
        }
        return errorsCounter;
    }

    public onFinish(): void {
        //sync forEach
        this.publishers.map(publisher => publisher.onFinish());
    }

    public getReport(): output.PublisherModel[] {
        return this.publishers.map(publisher => publisher.getReport());
    }

}

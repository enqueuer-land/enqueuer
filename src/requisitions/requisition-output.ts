import {Logger} from "../loggers/logger";
import {PublisherFactory} from "../publishers/publisher-factory";
import {Publisher} from "../publishers/publisher";

export class RequisitionOutput {

    private type: string;
    private publisher: Publisher;

    constructor(output: any) {
        this.type = output.type;
        this.publisher = new PublisherFactory().createPublisher(output);
    }

    public publish(message: string): void {
        Logger.info(`Publish ${this.type}`);
        this.publisher.payload = message;
        this.publisher.publish()
            .catch(err => {
                Logger.warning(`Couldn't publish in ${this.type}: ${err}`);
            });
    }
}
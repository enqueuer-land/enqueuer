import {Logger} from "../loggers/logger";
import {Publisher} from "../publishers/publisher";
import {Container} from "../injector/container";

export class RequisitionOutput {

    private type: string;
    private publisher: Publisher;

    constructor(output: any) {
        this.type = output.type;
        this.publisher = Container().Publisher.create(output);
    }

    public publish(message: string): void {
        this.publisher.payload = message;
        this.publisher.publish()
            .catch(err => {
                Logger.warning(`Couldn't publish in ${this.type}: ${err}`);
            });
    }
}
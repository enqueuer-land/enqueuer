import {Publisher} from "./publisher";

export class NullPublisher extends Publisher {

    constructor(publish: any) {
        super(publish);
    }

    public publish(): Promise<void> {
        return Promise.reject(`Undefined publishing protocol to start event: ${this.protocol}`);
    }

}
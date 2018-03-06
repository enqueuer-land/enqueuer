import {Publisher} from "./publisher";

export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        return Promise.reject(`Undefined publishing protocol to publish event: ${this.protocol}`);
    }

}
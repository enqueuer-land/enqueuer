import {EventCallback} from "../../event-callback";

export class Publish {

    protocol: string | null = null;
    payload: string | null = null;
    prePublishing: string | null = null;

    constructor(publish: any) {
        if (publish) {
            this.protocol = publish.protocol;
            this.payload = publish.payload;
            this.prePublishing = publish.prePublishing;
        }
    }

    execute(eventCallback: EventCallback): void {}

    createPrePublishingFunction(): Function | null {
        if (this.prePublishing == null)
            return null;

        const fullBody: string = `${this.prePublishing};`;
        return new Function('message', fullBody);
    }
}
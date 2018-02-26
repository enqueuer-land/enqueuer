import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {Subscription} from "../subscription/subscription";
export class StartEvent {

    timeout: number = -1;

    @Type(() => Publish)
    publish: Publish | null = null;

    @Type(() => Subscription)
    subscription: Subscription | null = null;

    execute(eventCallback: EventCallback): void {
        if (this.publish) {
            this.publish.eventCallback = eventCallback;
            this.publish.execute();
        }
        // if (this.subscription)
        //     this.subscription.subscribe(eventCallback);
    }
}

export class Publish {

    eventCallback: EventCallback = () => {};

    // @Type(() => PublishMqtt)
    // mqtt: PublishMqtt | null = null;

    @Type(() => PublishRest)
    rest: PublishRest | null = null;

    prePublishing: string | null = null;

    execute(): boolean {
        console.log(`Publishing`)
        this.eventCallback(this);
        // if (this.mqtt)
        //     return this.mqtt.publish();
        if (this.rest)
            return this.rest.publish();
        console.log("No publish method valid was found");
        return false;
    }

    createPrePublishingFunction(): Function | null {
        if (this.prePublishing == null)
            return null;

        const fullBody: string = `${this.prePublishing};`;
        return new Function('message', fullBody);
    }
}

export class PublishMqtt {
    brokerAddress: string = "";
    topic: string = "";
    payload: string = "";

    publish(): boolean {
        return true;
    }

}

const request = require("request");
    export class PublishRest {
    endpoint: string = "";
    method: string = "";
    header: any = {};
    payload: string = "";

    publish(): boolean {
        request.post({
                url: this.endpoint,
                body: this.payload
            },
            (error: any, response: any, body: any) =>
            {
                if (error) {
                    console.log("Error to publish http: "  + error)
                }
            });


        return true;
    }

}

import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {PublishRest} from "./publish-rest";
import {PublishMqtt} from "./publish-mqtt";

export class Publish {

    eventCallback: EventCallback = () => {};

    @Type(() => PublishMqtt)
    mqtt: PublishMqtt | null = null;

    @Type(() => PublishRest)
    rest: PublishRest | null = null;

    prePublishing: string | null = null;

    execute(): boolean {
        console.log(`Publishing`)
        this.eventCallback(this);
        if (this.mqtt)
            return this.mqtt.publish();
        if (this.rest)
            return this.rest.publish();
        console.log("No valid publish method was found");
        return false;
    }

    createPrePublishingFunction(): Function | null {
        if (this.prePublishing == null)
            return null;

        const fullBody: string = `${this.prePublishing};`;
        return new Function('message', fullBody);
    }
}
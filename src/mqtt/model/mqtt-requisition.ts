import {Type, plainToClass} from "class-transformer";
import "reflect-metadata";

export class MqttRequisition {
    protocol: string = "";
    brokerAddress: string = "";

    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => Publish)
    publish: Publish | null = null;
}

export class Publish {
    topic: string = "";
    payload: string = "";
}

export class Subscription {
    timeout: number | null = null;
    topic: string = "";

    onMessageReceived: string | null = null;

    createTestFunction(): Function | null {
        if (this.onMessageReceived == null)
            return null;

        const fullBody: string = `let test = {}; ${this.onMessageReceived};return test;`;
        return new Function('message', fullBody);
    }
}
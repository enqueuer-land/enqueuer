import {Type, plainToClass, Exclude} from "class-transformer";
import "reflect-metadata";

export class MqttRequisition {
    protocol: string = "";
    brokerAddress: string = "";

    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => StartEvent)
    startEvent: StartEvent | any = null;

    report: any;
}

export class StartEvent {
    @Type(() => Publish)
    publish: Publish | null = null;
}

export class Publish {
    topic: string = "";
    payload: string = "";

    prePublishing: string | null = null;

    createPrePublishingFunction(): Function | null {
        if (this.prePublishing == null)
            return null;

        const fullBody: string = `${this.prePublishing};`;
        return new Function('message', fullBody);
    }
}

export class Subscription {
    timeout: number | null = null;
    topic: string = "";

    onMessageReceived: string | null = null;

    createOnMessageReceivedFunction(): Function | null {
        if (this.onMessageReceived == null)
            return null;

        const fullBody: string = `let test = {}; let report = {}; ${this.onMessageReceived};return {test: test, report: report};`;
        return new Function('message', 'startEvent', fullBody);
    }
}
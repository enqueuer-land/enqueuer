import {Type, plainToClass, Exclude} from "class-transformer";
import "reflect-metadata";


export type EventCallback = (message: any) => void;
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
        if (this.subscription)
            this.subscription.subscribe(eventCallback);
    }
}

export class Requisition {
    protocol: string = "";
    brokerAddress: string = "";

    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => StartEvent)
    startEvent: StartEvent = new StartEvent();

    reports: any;
}


export class Publish {

    eventCallback: EventCallback = () => {};

    payload: string = "";

    @Type(() => PublishMqtt)
    mqtt: PublishMqtt | null = null;
    
    @Type(() => PublishRest)
    rest: PublishRest | null = null;

    prePublishing: string | null = null;

    execute(): boolean {
        console.log(`I should publish in this: ${JSON.stringify(this, null, 2)}`)
        this.eventCallback(this.payload);
        if (this.mqtt)
            return this.mqtt.publish();
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

    publish(): boolean {
        return true;
    }
    
}

export class PublishRest {
    endPoint: string = "";
    method: string = "";
    header: any = {};

    publish(): boolean {
        return true;
    }
    
}

export class Subscription {

    @Type(() => SubscribeMqtt)
    mqtt: SubscribeMqtt | null = null;

    timeout: number = -1;

    onMessageReceived: string | null = null;

    public subscribe(callback: EventCallback): boolean {
        console.log(`I should subscribe in this: ${JSON.stringify(this, null, 2)}`)
        callback(this);      
        return true;
    }

    createOnMessageReceivedFunction(): Function | null {
        if (this.onMessageReceived == null)
            return null;

        const fullBody: string = `let test = {}; let report = {}; ${this.onMessageReceived};return {test: test, report: report};`;
        return new Function('message', 'startEvent', fullBody);
    }
}

export class SubscribeMqtt {
    brokerAddress: string = "";
    topic: string = "";

    publish(): boolean {
        return true;
    }
    
}
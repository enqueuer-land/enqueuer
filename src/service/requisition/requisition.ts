import {Type, plainToClass, Exclude} from "class-transformer";
import "reflect-metadata";

export class Requisition {
    protocol: string = "";
    brokerAddress: string = "";

    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => StartEvent)
    startEvent: StartEvent | null = null;

    report: any;
}

export class StartEvent {
    @Type(() => Publish)
    publish: Publish | null = null;
}

export class Publish {

    @Type(() => PublishMqtt)
    mqtt: PublishMqtt | null = null;
    
    
    @Type(() => PublishRest)
    rest: PublishRest | null = null;

    prePublishing: string | null = null;

    execute(): boolean {
        console.log(`I should publish in this: ${JSON.stringify(this, null, 2)}`)
        if (this.mqtt)
            return this.mqtt.publish();
        console.log("No publish method was found");
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

export class PublishRest {
    endPoint: string = "";
    method: string = "";
    header: any = {};
    payload: string = "";

    publish(): boolean {
        return true;
    }
    
}

export type SubscriptionCallback = (message: any) => void;
export class Subscription {

    @Type(() => SubscribeMqtt)
    mqtt: SubscribeMqtt | null = null;

    timeout: number | null = null;

    onMessageReceived: string | null = null;

    public subscribe(callback: SubscriptionCallback): boolean {
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


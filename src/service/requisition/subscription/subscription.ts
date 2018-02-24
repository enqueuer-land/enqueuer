import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {MqttSubscription} from "./mqtt-subscription";

export class Subscription {

    @Type(() => MqttSubscription)
    mqtt: MqttSubscription | null = null;

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
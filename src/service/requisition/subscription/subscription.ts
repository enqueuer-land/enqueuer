import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {MqttSubscription} from "./mqtt-subscription";

export class Subscription {

    @Type(() => MqttSubscription)
    mqtt: MqttSubscription | null = null;

    timeout: number = -1;

    onMessageReceived: string | null = null;

    public unsubscribe(): void {
        if (this.mqtt)
            return this.mqtt.unsubscribe();
    }

    public subscribe(callback: EventCallback): boolean {
        if (this.mqtt)
            return this.mqtt.subscribe((event: EventCallback) => callback(this));
        return true;
    }

    createOnMessageReceivedFunction(): Function | null {
        if (this.onMessageReceived == null)
            return null;

        const fullBody: string = `let test = {}; let report = {}; ${this.onMessageReceived};return {test: test, report: report};`;
        return new Function('message', 'startEvent', fullBody);
    }
}
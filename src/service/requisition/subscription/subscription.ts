import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {MqttSubscription} from "./mqtt-subscription";

export abstract class Subscription {

    @Type(() => MqttSubscription)
    mqtt: MqttSubscription | null = null;

    public unsubscribe(): void {
        if (this.mqtt)
            this.mqtt.unsubscribe();
    }

    public subscribe(callback: EventCallback, onSubscriptionCompleted: EventCallback = () => {}): void{
        if (this.mqtt)
            this.mqtt.subscribe(callback, onSubscriptionCompleted);
    }

    createOnMessageReceivedFunction(): Function | null {
        if (this.mqtt)
            return this.mqtt.createOnMessageReceivedFunction();
        return null;
    }

}
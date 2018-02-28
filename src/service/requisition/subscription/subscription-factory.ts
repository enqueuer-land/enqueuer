import {Subscription} from "./subscription";
import {MqttSubscription} from "./mqtt-subscription";

export class SubscriptionFactory {
    public createSubscription(subscriptionAttributes: any): Subscription | null {
        if (subscriptionAttributes.protocol === "mqtt")
            return new MqttSubscription(subscriptionAttributes);
        return null;
    }
}
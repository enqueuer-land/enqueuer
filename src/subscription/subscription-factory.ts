import {Subscription} from "./subscription";
import {MqttSubscription} from "./mqtt-subscription";
import {NullSubscription} from "./null-subscription";

export class SubscriptionFactory {
    public createSubscription(subscriptionAttributes: any): Subscription {
        if (subscriptionAttributes.protocol === "mqtt")
            return new MqttSubscription(subscriptionAttributes);
        return new NullSubscription(subscriptionAttributes);
    }
}
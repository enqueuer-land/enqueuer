import {SubscriptionAttributes} from "./subscription-attributes";
import {Subscription} from "./subscription";
import {MqttSubscription} from "./mqtt-subscription";

export class SubscriptionFactory {
    public createSubscription(subscriptionAttributes: SubscriptionAttributes): Subscription | null {
        if (subscriptionAttributes.protocol === "mqtt")
            return new MqttSubscription(subscriptionAttributes);
        return null;
    }
}
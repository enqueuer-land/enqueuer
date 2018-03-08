import {Subscription} from "./subscription";
import {MqttSubscription} from "./mqtt-subscription";
import {NullSubscription} from "./null-subscription";
import {UdsSubscription} from "./uds-subscription";
import {StandardInputSubscription} from "./standard-input-subscription";
import {FolderSubscription} from "./folder-subscription";
import {AmqpSubscription} from "./amqp-subscription";
import {HttpSubscription} from "./http-subscription";

export class SubscriptionFactory {
    public createSubscription(subscriptionAttributes: any): Subscription {
        if (subscriptionAttributes.type === "mqtt")
            return new MqttSubscription(subscriptionAttributes);
        if (subscriptionAttributes.type === "amqp")
            return new AmqpSubscription(subscriptionAttributes);
        if (subscriptionAttributes.type === "uds")
            return new UdsSubscription(subscriptionAttributes)
        if (subscriptionAttributes.type === "standardInput")
            return new StandardInputSubscription();
        if (subscriptionAttributes.type === "watchFolder")
            return new FolderSubscription(subscriptionAttributes);
        if (subscriptionAttributes.type === "http")
            return new HttpSubscription(subscriptionAttributes);
        return new NullSubscription(subscriptionAttributes);
    }
}
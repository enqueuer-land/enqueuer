import {MetaFunctionCreator} from "./meta-function-creator";
import {SubscriptionModel} from "../models/subscription-model";
import {Subscription} from "../subscriptions/subscription";

export class OnMessageReceivedMetaFunction implements MetaFunctionCreator {

    private subscription: Subscription;

    public constructor(subscriptionAttributes: Subscription) {
        this.subscription = subscriptionAttributes;
    }

    public createBody(): string {
        return    `let test = {};
                    let report = {};
                    let message = ${JSON.stringify(this.subscription.messageReceived)};
                    ${this.subscription.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }

}
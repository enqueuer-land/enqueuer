import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";
import {NullFactoryFunction} from "../injector/factory-function";
import {SubscriptionModel} from "../requisitions/model/subscription-model";

@Injectable(NullFactoryFunction)
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public connect(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

    public receiveMessage(): Promise<string> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

}
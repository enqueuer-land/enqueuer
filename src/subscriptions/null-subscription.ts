import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";
import {NullFactoryPredicate} from "../injector/factory-predicate";
import {SubscriptionModel} from "../requisitions/model/subscription-model";

@Injectable(NullFactoryPredicate)
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
import {Subscription} from "./subscription";

export class NullSubscription extends Subscription {

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
    }

    public subscribe(onMessageReceived: Function, onSubscriptionCompleted: Function): boolean {
            onSubscriptionCompleted(`Undefined subscription: ${JSON.stringify(this)}`);
            onMessageReceived(this);
        return false;
    }

}
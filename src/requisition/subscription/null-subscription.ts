import {Subscription} from "./subscription";

export class NullSubscription extends Subscription {

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
    }

    public connect(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

    public receiveMessage(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

}
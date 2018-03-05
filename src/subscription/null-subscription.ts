import {Subscription} from "./subscription";

export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);

        console.log(`NullSubscription: ${JSON.stringify(subscriptionAttributes, null, 3)}`)
    }

    public connect(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

    public receiveMessage(): Promise<string> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

}
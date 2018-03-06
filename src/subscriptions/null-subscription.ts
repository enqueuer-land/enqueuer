import {Subscription} from "./subscription";
import {Logger} from "../log/logger";

export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);

        Logger.error(`NullSubscription: ${JSON.stringify(subscriptionAttributes, null, 3)}`)
    }

    public connect(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

    public receiveMessage(): Promise<string> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

}
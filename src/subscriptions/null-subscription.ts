import {Subscription} from "./subscription";
import {Injectable} from "../injector/injector";
import {NullFactoryFunction} from "../injector/factory-function";

@Injectable(NullFactoryFunction)
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);
    }

    public connect(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

    public receiveMessage(): Promise<string> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

}
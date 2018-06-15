import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';

@Injectable()
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
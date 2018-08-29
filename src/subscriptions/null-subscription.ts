import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';

//TODO test it
@Injectable()
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public subscribe(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

    public receiveMessage(): Promise<any> {
        return Promise.reject(`Undefined subscription: ${JSON.stringify(this)}`);
    }

}
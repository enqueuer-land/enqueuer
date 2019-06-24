import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';

export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public subscribe(): Promise<void> {
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

    public async receiveMessage(): Promise<void> {
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

}

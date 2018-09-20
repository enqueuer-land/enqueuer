import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

@Injectable()
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public subscribe(): Promise<void> {
        return Promise.reject(`Undefined subscription: ${new JavascriptObjectNotation().stringify(this)}`);
    }

    public async receiveMessage(): Promise<any> {
        return Promise.reject(`Undefined subscription: ${new JavascriptObjectNotation().stringify(this)}`);
    }

}
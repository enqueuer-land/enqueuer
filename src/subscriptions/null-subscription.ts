import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {ProtocolManager} from '../configurations/protocol-manager';

@Injectable()
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public subscribe(): Promise<void> {
        ProtocolManager.getInstance().suggestSimilarSubscriptions(this.type);
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

    public async receiveMessage(): Promise<any> {
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

}
import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {ProtocolsManager} from '../configurations/protocols-manager';

@Injectable()
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public subscribe(): Promise<void> {
        new ProtocolsManager().suggestSubscriptionBasedOn(this.type);
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

    public async receiveMessage(): Promise<any> {
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

}
import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {DependencyManager} from '../configurations/dependency-manager';

@Injectable()
export class NullSubscription extends Subscription {
    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
    }

    public subscribe(): Promise<void> {
        return Promise.reject(`Undefined subscription: '${this.type}'. Trying installing one of: ${new DependencyManager()
                                                                    .listAvailable().join('; ')} with 'npm install $(protocol) --no-optional'`);
    }

    public async receiveMessage(): Promise<any> {
        return Promise.reject(`Undefined subscription: '${this.type}'`);
    }

}
import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Protocol} from '../protocols/protocol';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';

const protocol = new Protocol('custom')
    .registerAsSubscription();

@Injectable({predicate: (subscription: any) => protocol.matches(subscription.type)})
export class CustomSubscription extends Subscription {

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
    }

    public async subscribe(): Promise<void> {
        this.module = await import(this.implementation) as any;
        return this.module.subscribe(this, Store.getData(), Logger);
    }

    public async receiveMessage(): Promise<any> {
        return this.module.receiveMessage(this, Store.getData(), Logger);
    }

    public async unsubscribe(): Promise<any> {
        if (this.module.unsubscribe) {
            return this.module.unsubscribe(this, Store.getData(), Logger);
        }
    }

    public async sendResponse(): Promise<any> {
        if (this.module.sendResponse) {
            return this.module.sendResponse(this, Store.getData(), Logger);
        }
    }
}

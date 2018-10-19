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
        this.custom = await import(this.module) as any;
        return this.custom.subscribe(this, {store: Store.getData(), logger: Logger});
    }

    public async receiveMessage(): Promise<any> {
        return this.custom.receiveMessage(this, {store: Store.getData(), logger: Logger});
    }

    public async unsubscribe(): Promise<any> {
        if (this.custom.unsubscribe) {
            return this.custom.unsubscribe(this, {store: Store.getData(), logger: Logger});
        }
    }

    public async sendResponse(): Promise<any> {
        if (this.custom.sendResponse) {
            return this.custom.sendResponse(this, {store: Store.getData(), logger: Logger});
        }
    }
}

import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import {Protocol} from '../protocols/protocol';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import * as fs from 'fs';
import requireFromString from 'require-from-string';

const protocol = new Protocol('custom')
    .registerAsSubscription();

@Injectable({predicate: (subscription: any) => protocol.matches(subscription.type)})
export class CustomSubscription extends Subscription {

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
        try {
            const moduleString: string = fs.readFileSync(this.module).toString();
            const module = requireFromString(moduleString);
            this.custom = new module.Subscription(subscriptionModel);
        } catch (err) {
            Logger.error(`Error loading module '${this.module}': ${err}`);
        }
    }

    public async subscribe(): Promise<void> {
        return this.custom.subscribe({store: Store.getData(), logger: Logger});
    }

    public async receiveMessage(): Promise<any> {
        return this.custom.receiveMessage({store: Store.getData(), logger: Logger});
    }

    public async unsubscribe(): Promise<any> {
        if (this.custom.unsubscribe) {
            return this.custom.unsubscribe({store: Store.getData(), logger: Logger});
        }
    }

    public async sendResponse(): Promise<any> {
        if (this.custom.sendResponse) {
            return this.custom.sendResponse({store: Store.getData(), logger: Logger});
        }
    }
}

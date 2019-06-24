import {Subscription} from './subscription';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Store} from '../configurations/store';
import {Logger} from '../loggers/logger';
import * as fs from 'fs';
import requireFromString from 'require-from-string';
import {MainInstance} from '../plugins/main-instance';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';

class CustomSubscription extends Subscription {

    constructor(subscriptionModel: SubscriptionModel) {
        super(subscriptionModel);
        try {
            const moduleString: string = fs.readFileSync(this.module).toString();
            const module = requireFromString(moduleString);
            this['custom'] = new module.Subscription(this);
        } catch (err) {
            Logger.error(`Error loading module '${this.module}': ${err}`);
        }
    }

    public async subscribe(): Promise<void> {
        return this.custom.subscribe({store: Store.getData(), logger: Logger});
    }

    public async receiveMessage(): Promise<void> {
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

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new SubscriptionProtocol('custom',
        (subscriptionModel: SubscriptionModel) => new CustomSubscription(subscriptionModel));
    mainInstance.protocolManager.addProtocol(protocol);
}

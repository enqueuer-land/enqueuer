import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {Event} from '../models/events/event';

export abstract class Subscription {
    public name: string;
    public messageReceived?: any;
    public timeout?: number;
    public onMessageReceived?: Event;
    public onFinish?: Event;
    public response?: any;
    public type?: string;
    public avoid: boolean = false;

    [propName: string]: any;
    protected constructor(subscriptionAttributes: SubscriptionModel) {
        Object.keys(subscriptionAttributes).forEach(key => {
            this[key] = subscriptionAttributes[key];
        });
        this.name = subscriptionAttributes.name;
    }

    public abstract subscribe(): Promise<void>;
    public abstract receiveMessage(): Promise<any>;
    public async unsubscribe(): Promise<void> {
        //do nothing
    }

    public async sendResponse(): Promise<void> {
        Logger.debug(`Subscription of ${this.type} does not provide synchronous response`);
    }

    public onMessageReceivedTests(): TestModel[] {
        return [];
    }
}
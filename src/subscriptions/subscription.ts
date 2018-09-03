import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Logger} from '../loggers/logger';
import {TestModel} from '../models/outputs/test-model';
import {Event} from '../events/event';

export abstract class Subscription {

    public name: string;
    public messageReceived?: any;
    public timeout?: number;
    public onMessageReceived?: Event;
    public onFinish?: Event;
    public response?: any;
    public type?: string;
    public avoid: boolean = false;

    protected constructor(subscriptionAttributes: SubscriptionModel) {
        this.messageReceived = subscriptionAttributes.messageReceived;
        this.name = subscriptionAttributes.name;
        this.timeout = subscriptionAttributes.timeout;
        this.response = subscriptionAttributes.response;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
        this.onFinish = subscriptionAttributes.onFinish;
        this.avoid = subscriptionAttributes.avoid || false;
    }

    public abstract subscribe(): Promise<void>;
    public abstract receiveMessage(): Promise<any>;
    public unsubscribe(): void {
        //do nothing
    }

    public async sendResponse(): Promise<void> {
        Logger.warning(`Subscription of ${this.type} does not provide synchronous response`);
    }

    public onMessageReceivedTests(): TestModel[] {
        return [];
    }
}
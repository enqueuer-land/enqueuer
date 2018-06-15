import {SubscriptionModel} from '../models/inputs/subscription-model';

export abstract class Subscription {

    public name: string;
    public messageReceived?: string;
    public timeout?: number;
    public onMessageReceived?: string;
    public type?: string;

    protected constructor(subscriptionAttributes: SubscriptionModel) {
        this.messageReceived = subscriptionAttributes.messageReceived;
        this.name = subscriptionAttributes.name;
        this.timeout = subscriptionAttributes.timeout;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
    }

    public abstract connect(): Promise<void>;
    public abstract receiveMessage(): Promise<string>;
    public unsubscribe(): void {}
}
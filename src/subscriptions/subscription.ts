import {SubscriptionModel} from "../requisitions/model/subscription-model";

export abstract class Subscription {

    public messageReceived: string | null = null;
    public timeout: number | undefined;
    public onMessageReceived: string | undefined;
    public type: string | null = null;

    protected constructor(subscriptionAttributes: SubscriptionModel) {
        this.messageReceived = subscriptionAttributes.message;
        this.timeout = subscriptionAttributes.timeout;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
    }

    public abstract connect(): Promise<void>;
    public abstract receiveMessage(): Promise<string>;
    public unsubscribe(): void {}
}
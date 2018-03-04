export abstract class Subscription {

    public messageReceived: string | null = null;
    public timeout: number | null = null;
    public onMessageReceivedFunctionBody: string | null = null;

    protected constructor(subscriptionAttributes: any) {
        if (subscriptionAttributes) {
            this.messageReceived = subscriptionAttributes.message;
            this.timeout = subscriptionAttributes.timeout;
            this.onMessageReceivedFunctionBody = subscriptionAttributes.onMessageReceivedFunctionBody;
        }
    }

    public abstract connect(): Promise<void>;
    public abstract receiveMessage(): Promise<void>;
    public abstract unsubscribe(): void;
}
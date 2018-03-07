export abstract class Subscription {

    public messageReceived: string | null = null;
    public timeout: number | null = null;
    public onMessageReceivedFunctionBody: string | null = null;
    public type: string | null = null;

    protected constructor(subscriptionAttributes: any) {
        if (subscriptionAttributes) {
            this.messageReceived = subscriptionAttributes.message;
            this.timeout = subscriptionAttributes.timeout;
            this.type = subscriptionAttributes.type;
            this.onMessageReceivedFunctionBody = subscriptionAttributes.onMessageReceivedFunctionBody;
        }
    }

    public abstract connect(): Promise<void>;
    public abstract receiveMessage(): Promise<string>;
    public unsubscribe(): void {}
}
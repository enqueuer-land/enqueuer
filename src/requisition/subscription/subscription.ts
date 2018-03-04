
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

    public createOnMessageReceivedFunction(): Function | null {
        if (this.onMessageReceivedFunctionBody == null)
            return null;

        const fullBody: string =    `let test = {};
                                    let report = {};
                                    ${this.onMessageReceivedFunctionBody};
                                    return {
                                            test: test,
                                            report: report
                                     };`;
        return new Function('message', fullBody);
    }

    public abstract connect(): Promise<void>;
    public abstract receiveMessage(): Promise<void>;
    public unsubscribe(): void {};
}
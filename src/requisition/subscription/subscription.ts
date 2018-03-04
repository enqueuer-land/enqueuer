import {EventCallback} from "../event-callback";

export abstract class Subscription {

    public message: string | null = null;
    public timeout: number = -1;
    public onMessageReceivedFunctionBody: string | null = null;

    protected constructor(subscriptionAttributes: any) {
        if (subscriptionAttributes) {
            this.message = subscriptionAttributes.message;
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

    public unsubscribe(): void {};

    public abstract subscribe(onMessageReceived: EventCallback, onSubscriptionCompleted: EventCallback): boolean;

}
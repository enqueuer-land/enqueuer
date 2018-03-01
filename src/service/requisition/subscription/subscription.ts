import {EventCallback} from "../event-callback";

export abstract class Subscription {

    message: string | null = null;
    timeout: number = -1;
    onMessageReceivedFunctionBody: string | null = null;

    protected constructor(subscriptionAttributes: any) {
        if (subscriptionAttributes) {
            this.message = subscriptionAttributes.message;
            this.timeout = subscriptionAttributes.timeout;
            this.onMessageReceivedFunctionBody = subscriptionAttributes.onMessageReceivedFunctionBody;
        }
    }

    createOnMessageReceivedFunction(): Function | null {
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
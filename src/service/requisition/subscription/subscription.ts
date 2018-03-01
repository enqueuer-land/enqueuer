import {EventCallback} from "../event-callback";
import {Exclude} from "class-transformer";

export class Subscription {

    @Exclude()
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
                                    let valid = true;
                                    ${this.onMessageReceivedFunctionBody};
                                    return {
                                                test: test,
                                                report: report,
                                                 valid: valid
                                     };`;
        return new Function('message', 'startEvent', fullBody);
    }

    public unsubscribe(): void {};

    public subscribe(onMessageReceived: EventCallback, onSubscriptionCompleted: EventCallback): boolean {
        return true;
    }

}
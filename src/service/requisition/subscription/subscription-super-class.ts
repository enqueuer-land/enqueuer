import {EventCallback} from "../event-callback";

export class SubscriptionSuperClass {

    message: string | null = null;

    timeout: number = -1;

    onMessageReceivedFunctionBody: string | null = null;

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

    public subscribe(callback: EventCallback, onSubscriptionCompleted: EventCallback): boolean {
        return true;
    }

}
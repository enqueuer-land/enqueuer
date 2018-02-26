import {EventCallback} from "../event-callback";

export class SubscriptionSuperClass {
    message: string = "";

    timeout: number = -1;

    onMessageReceivedFunctionBody: string | null = null;

    createOnMessageReceivedFunction(): Function | null {
        if (this.onMessageReceivedFunctionBody == null)
            return null;

        const fullBody: string =    `let test = {};
                                    let report = {};
                                    ${this.onMessageReceivedFunctionBody};
                                    return {test: test, report: report};`;
        return new Function('message', 'startEvent', fullBody);
    }

    public unsubscribe(): void {};

    public subscribe(callback: EventCallback, onSubscriptionCompleted: EventCallback): boolean {
        return true;
    }

}
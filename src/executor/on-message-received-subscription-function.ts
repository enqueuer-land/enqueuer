import {FunctionCreator} from "./function-creator";
import {Subscription} from "../requisition/subscription/subscription";

export class OnMessageReceivedSubscriptionFunction implements FunctionCreator {

    private subscription: Subscription;

    public constructor(subscription: Subscription) {
        this.subscription = subscription;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let message = ${this.subscription.messageReceived};
                                    ${this.subscription.onMessageReceivedFunctionBody};
                                    return {
                                            test: test,
                                            report: report
                                     };`;
        return new Function(fullBody);
    }

}
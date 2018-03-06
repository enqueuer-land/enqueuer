import {FunctionCreator} from "./function-creator";

export class OnMessageReceivedSubscriptionFunction implements FunctionCreator {

    private subscriptionAttributed: any;

    public constructor(subscriptionAttributed: any) {
        this.subscriptionAttributed = subscriptionAttributed;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let message = ${JSON.stringify(this.subscriptionAttributed.messageReceived)};
                                    ${this.subscriptionAttributed.onMessageReceivedFunctionBody};
                                    return {
                                            test: test,
                                            report: report
                                     };`;
        return new Function(fullBody);
    }

}
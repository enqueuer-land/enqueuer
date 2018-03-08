import {MetaFunctionCreator} from "./meta-function-creator";

export class OnMessageReceivedMetaFunction implements MetaFunctionCreator {

    private subscriptionAttributes: any;

    public constructor(subscriptionAttributes: any) {
        this.subscriptionAttributes = subscriptionAttributes;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let message = ${JSON.stringify(this.subscriptionAttributes.messageReceived)};
                                    ${this.subscriptionAttributes.onMessageReceived};
                                    return {
                                            test: test,
                                            report: report
                                     };`;
        return new Function(fullBody);
    }

}
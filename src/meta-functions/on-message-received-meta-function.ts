import {MetaFunctionCreator} from "./meta-function-creator";
import {SubscriptionModel} from "../requisitions/models/subscription-model";

export class OnMessageReceivedMetaFunction implements MetaFunctionCreator {

    private subscriptionAttributes: SubscriptionModel;

    public constructor(subscriptionAttributes: SubscriptionModel) {
        this.subscriptionAttributes = subscriptionAttributes;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let variables = {};
                                    let message = ${JSON.stringify(this.subscriptionAttributes.messageReceived)};
                                    ${this.subscriptionAttributes.onMessageReceived};
                                    return {
                                            variables: variables,
                                            test: test,
                                            report: report
                                     };`;
        return new Function("args", fullBody);
    }

}
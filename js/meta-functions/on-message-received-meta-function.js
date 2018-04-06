"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OnMessageReceivedMetaFunction {
    constructor(subscriptionAttributes) {
        this.subscriptionAttributes = subscriptionAttributes;
    }
    createFunction() {
        const fullBody = `let test = {};
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
exports.OnMessageReceivedMetaFunction = OnMessageReceivedMetaFunction;

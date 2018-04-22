"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OnMessageReceivedMetaFunction {
    constructor(subscriptionAttributes) {
        this.subscription = subscriptionAttributes;
    }
    createBody() {
        return `let test = {};
                    let report = {};
                    let message = ${JSON.stringify(this.subscription.messageReceived)};
                    ${this.subscription.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }
}
exports.OnMessageReceivedMetaFunction = OnMessageReceivedMetaFunction;

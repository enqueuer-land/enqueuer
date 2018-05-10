"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OnMessageReceivedMetaFunctionBody {
    constructor(messageReceived, onMessageReceived) {
        this.messageReceived = messageReceived;
        this.onMessageReceived = onMessageReceived;
    }
    createBody() {
        return `let test = {};
                    let report = {};
                    let message = ${JSON.stringify(this.messageReceived)};
                    ${this.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }
}
exports.OnMessageReceivedMetaFunctionBody = OnMessageReceivedMetaFunctionBody;

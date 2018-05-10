"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const on_message_received_meta_function_body_1 = require("./on-message-received-meta-function-body");
const meta_function_executor_1 = require("./meta-function-executor");
const logger_1 = require("../loggers/logger");
class OnMessageReceivedReporter {
    constructor(messageReceived, onMessageReceived) {
        this.messageReceived = messageReceived;
        this.onMessageReceived = onMessageReceived;
    }
    execute() {
        const onMessageReceivedSubscription = new on_message_received_meta_function_body_1.OnMessageReceivedMetaFunctionBody(this.messageReceived, this.onMessageReceived);
        const functionResponse = new meta_function_executor_1.MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        logger_1.Logger.trace(`Response of onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        return functionResponse;
    }
}
exports.OnMessageReceivedReporter = OnMessageReceivedReporter;

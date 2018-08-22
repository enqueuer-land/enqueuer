"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_executor_1 = require("./event-executor");
//TODO test it
class OnMessageReceivedEventExecutor extends event_executor_1.EventExecutor {
    constructor(name, messageReceiver) {
        super(messageReceiver.onMessageReceived);
        this.messageReceiver = messageReceiver;
        if (typeof (this.messageReceiver.messageReceived) == 'object' && !Buffer.isBuffer(this.messageReceiver.messageReceived)) {
            Object.keys(this.messageReceiver.messageReceived).forEach((key) => {
                this.addArgument(key, this.messageReceiver.messageReceived[key]);
            });
        }
        this.addArgument('message', this.messageReceiver.messageReceived);
        this.addArgument(name, this.messageReceiver);
    }
    trigger() {
        logger_1.Logger.trace(`Executing on message received`);
        if (!this.messageReceiver.onMessageReceived || !this.messageReceiver.messageReceived) {
            logger_1.Logger.trace(`No onMessageReceived to be played here`);
            return [];
        }
        return this.execute().map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
    }
}
exports.OnMessageReceivedEventExecutor = OnMessageReceivedEventExecutor;

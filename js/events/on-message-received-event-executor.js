"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_test_executor_1 = require("./event-test-executor");
class OnMessageReceivedEventExecutor {
    constructor(messageReceiver) {
        this.owner = messageReceiver;
    }
    execute() {
        logger_1.Logger.trace(`Executing on message received`);
        if (!this.owner.onMessageReceived || !this.owner.messageReceived) {
            logger_1.Logger.trace(`No onMessageReceived to be played here`);
            return [];
        }
        return this.buildEventTestExecutor().execute();
    }
    buildEventTestExecutor() {
        const eventTestExecutor = new event_test_executor_1.EventTestExecutor(this.owner.onMessageReceived);
        if (typeof (this.owner.messageReceived) == 'object' && !Buffer.isBuffer(this.owner.messageReceived)) {
            Object.keys(this.owner.messageReceived).forEach((key) => {
                eventTestExecutor.addArgument(key, this.owner.messageReceived[key]);
            });
        }
        eventTestExecutor.addArgument('message', this.owner.messageReceived);
        eventTestExecutor.addArgument(this.owner.name, this.owner.value);
        return eventTestExecutor;
    }
}
exports.OnMessageReceivedEventExecutor = OnMessageReceivedEventExecutor;

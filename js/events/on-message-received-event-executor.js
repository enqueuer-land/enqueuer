"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_asserter_1 = require("./event-asserter");
//TODO test it
class OnMessageReceivedEventExecutor {
    constructor(name, messageReceiver) {
        this.name = name;
        this.messageReceiver = messageReceiver;
    }
    execute() {
        logger_1.Logger.trace(`Executing on message received`);
        if (!this.messageReceiver.onMessageReceived || !this.messageReceiver.messageReceived) {
            logger_1.Logger.trace(`No onMessageReceived to be played here`);
            return [];
        }
        return this.buildEventAsserter().assert().map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
    }
    buildEventAsserter() {
        const eventTestExecutor = new event_asserter_1.EventAsserter(this.messageReceiver.onMessageReceived);
        if (typeof (this.messageReceiver.messageReceived) == 'object' && !Buffer.isBuffer(this.messageReceiver.messageReceived)) {
            Object.keys(this.messageReceiver.messageReceived).forEach((key) => {
                eventTestExecutor.addArgument(key, this.messageReceiver.messageReceived[key]);
            });
        }
        eventTestExecutor.addArgument('message', this.messageReceiver.messageReceived);
        eventTestExecutor.addArgument(this.name, this.messageReceiver);
        return eventTestExecutor;
    }
}
exports.OnMessageReceivedEventExecutor = OnMessageReceivedEventExecutor;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_executor_1 = require("./event-executor");
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
        if (!this.messageReceiver.onMessageReceived || !this.messageReceiver.messageReceived) {
            return [];
        }
        return this.execute();
    }
}
exports.OnMessageReceivedEventExecutor = OnMessageReceivedEventExecutor;

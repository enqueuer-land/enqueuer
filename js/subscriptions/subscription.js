"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
class Subscription {
    constructor(subscriptionAttributes) {
        this.messageReceived = subscriptionAttributes.messageReceived;
        this.name = subscriptionAttributes.name;
        this.timeout = subscriptionAttributes.timeout;
        this.response = subscriptionAttributes.response;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
    }
    unsubscribe() {
        //do nothing
    }
    sendResponse() {
        logger_1.Logger.warning(`Subscription of ${this.type} does not provide synchronous response`);
    }
    onMessageReceivedTests() {
        return [];
    }
}
exports.Subscription = Subscription;

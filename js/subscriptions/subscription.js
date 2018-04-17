"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Subscription {
    constructor(subscriptionAttributes) {
        this.messageReceived = subscriptionAttributes.messageReceived;
        this.timeout = subscriptionAttributes.timeout;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
    }
    unsubscribe() { }
}
exports.Subscription = Subscription;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Subscription {
    constructor(subscriptionAttributes) {
        this.messageReceived = subscriptionAttributes.messageReceived;
        this.name = subscriptionAttributes.name;
        this.timeout = subscriptionAttributes.timeout;
        this.type = subscriptionAttributes.type;
        this.onMessageReceived = subscriptionAttributes.onMessageReceived;
    }
    unsubscribe() {
        //do nothing
    }
}
exports.Subscription = Subscription;

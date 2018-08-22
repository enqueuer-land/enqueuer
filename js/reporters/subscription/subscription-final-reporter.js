"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TODO test it
class SubscriptionFinalReporter {
    constructor(avoidable, hasMessage, hasTimedOut) {
        this.messageReceivedTestName = `Message received`;
        this.hasMessage = false;
        this.avoidable = avoidable;
        this.hasMessage = hasMessage;
        this.hasTimedOut = hasTimedOut;
    }
    getReport() {
        let tests = [];
        tests = tests.concat(this.createMessageReport());
        if (this.hasTimedOut) {
            tests = tests.concat(this.createTimeoutReport());
        }
        return tests;
    }
    createMessageReport() {
        if (this.hasMessage) {
            return this.createMessageReceived();
        }
        else {
            return this.createMessageNotReceived();
        }
    }
    createMessageReceived() {
        if (!this.avoidable) {
            return {
                valid: true,
                name: this.messageReceivedTestName,
                description: `Subscription has received its message`
            };
        }
        else {
            return {
                valid: false,
                name: this.messageReceivedTestName,
                description: `Avoidable subscription shouldn't have received a message`
            };
        }
    }
    createMessageNotReceived() {
        if (!this.avoidable) {
            return {
                valid: false,
                name: this.messageReceivedTestName,
                description: `Subscription has not received its message in a valid time`
            };
        }
        else {
            return {
                valid: true,
                name: this.messageReceivedTestName,
                description: `Avoidable subscription has not received a message`
            };
        }
    }
    createTimeoutReport() {
        const name = `No time out`;
        if (!this.avoidable) {
            return {
                valid: false,
                name: name,
                description: `Subscription has timed out`
            };
        }
        else {
            return {
                valid: true,
                name: name,
                description: `Avoidable subscription has not received a message`
            };
        }
    }
}
exports.SubscriptionFinalReporter = SubscriptionFinalReporter;

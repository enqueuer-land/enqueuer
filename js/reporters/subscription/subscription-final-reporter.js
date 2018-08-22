"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SubscriptionFinalReporter {
    constructor(avoidable, hasMessage, hasTimedOut) {
        this.messageReceivedTestName = `Message received`;
        this.subscriptionAvoidedTestName = `Subscription avoided`;
        this.noTimeOutTestName = `No time out`;
        this.hasMessage = false;
        this.avoidable = avoidable;
        this.hasMessage = hasMessage;
        this.hasTimedOut = hasTimedOut;
    }
    getReport() {
        let tests = [];
        if (this.avoidable) {
            tests = tests.concat(this.createAvoidableReport());
        }
        else {
            tests = tests.concat(this.createMessageReport());
        }
        if (this.hasTimedOut) {
            const timeoutReport = this.createTimeoutReport();
            if (timeoutReport) {
                tests = tests.concat(timeoutReport);
            }
        }
        return tests;
    }
    createMessageReport() {
        if (this.hasMessage) {
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
                description: `Subscription has not received its message`
            };
        }
    }
    createTimeoutReport() {
        if (!this.avoidable) {
            return {
                valid: false,
                name: this.noTimeOutTestName,
                description: `Not avoidable Subscription has timed out`
            };
        }
    }
    createAvoidableReport() {
        if (this.hasMessage) {
            return {
                valid: false,
                name: this.subscriptionAvoidedTestName,
                description: `Avoidable subscription should not receive a message`
            };
        }
        else {
            return {
                valid: true,
                name: this.subscriptionAvoidedTestName,
                description: `Avoidable subscription has not received a message`
            };
        }
    }
}
exports.SubscriptionFinalReporter = SubscriptionFinalReporter;

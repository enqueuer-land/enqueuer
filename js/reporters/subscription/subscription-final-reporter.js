"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SubscriptionFinalReporter {
    constructor(subscribed, avoidable, hasMessage, hasTimedOut) {
        this.messageReceivedTestName = `Message received`;
        this.subscriptionAvoidedTestName = `Subscription avoided`;
        this.noTimeOutTestName = `No time out`;
        this.subscribedTestName = `Subscribed`;
        this.hasMessage = false;
        this.subscribed = subscribed;
        this.avoidable = avoidable;
        this.hasMessage = hasMessage;
        this.hasTimedOut = hasTimedOut;
    }
    getReport() {
        if (!this.subscribed) {
            return this.createNotSubscribedTests();
        }
        let tests = [];
        if (this.avoidable) {
            tests = tests.concat(this.createAvoidableTests());
        }
        else {
            tests = tests.concat(this.createMessageTests());
        }
        return tests.concat(this.addTimeoutTests());
    }
    addTimeoutTests() {
        if (this.hasTimedOut) {
            return this.createTimeoutTests();
        }
        return [];
    }
    createNotSubscribedTests() {
        return [{
                valid: false,
                name: this.subscribedTestName,
                description: `Subscription is not able to connect`
            }];
    }
    createMessageTests() {
        if (this.hasMessage) {
            return [{
                    valid: true,
                    name: this.messageReceivedTestName,
                    description: `Subscription has received its message`
                }];
        }
        else {
            return [{
                    valid: false,
                    name: this.messageReceivedTestName,
                    description: `Subscription has not received its message`
                }];
        }
    }
    createTimeoutTests() {
        if (!this.avoidable) {
            return [{
                    valid: false,
                    name: this.noTimeOutTestName,
                    description: `Not avoidable Subscription has timed out`
                }];
        }
        return [];
    }
    createAvoidableTests() {
        if (this.hasMessage) {
            return [{
                    valid: false,
                    name: this.subscriptionAvoidedTestName,
                    description: `Avoidable subscription should not receive a message`
                }];
        }
        else {
            return [{
                    valid: true,
                    name: this.subscriptionAvoidedTestName,
                    description: `Avoidable subscription has not received a message`
                }];
        }
    }
}
exports.SubscriptionFinalReporter = SubscriptionFinalReporter;

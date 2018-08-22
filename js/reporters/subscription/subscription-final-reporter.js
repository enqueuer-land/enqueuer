"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../loggers/logger");
//TODO test it
class SubscriptionFinalReporter {
    constructor(avoidable, hasMessage, hasTimedOut) {
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
        logger_1.Logger.trace(`Subscription final report: ${JSON.stringify(tests)}`);
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
        const name = 'Message received';
        if (!this.avoidable) {
            return {
                valid: true,
                name: name,
                description: `Subscription has received its message`
            };
        }
        else {
            return {
                valid: false,
                name: name,
                description: `Avoidable subscription shouldn't have received a message`
            };
        }
    }
    createMessageNotReceived() {
        const name = `Subscription avoided`;
        if (!this.avoidable) {
            return {
                valid: false,
                name: name,
                description: `Subscription has not received its message in a valid time`
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

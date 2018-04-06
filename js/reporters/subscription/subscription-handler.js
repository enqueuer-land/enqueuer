"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta_function_executor_1 = require("../../meta-functions/meta-function-executor");
const on_message_received_meta_function_1 = require("../../meta-functions/on-message-received-meta-function");
const logger_1 = require("../../loggers/logger");
const date_controller_1 = require("../../timers/date-controller");
const container_1 = require("../../injector/container");
const subscription_1 = require("../../subscriptions/subscription");
const timeout_1 = require("../../timers/timeout");
class SubscriptionHandler {
    constructor(subscriptionAttributes) {
        this.hasTimedOut = false;
        this.handleKillSignal = (signal) => {
            logger_1.Logger.fatal(`Handling kill signal ${signal}`);
            this.cleanUp();
            new timeout_1.Timeout(() => {
                logger_1.Logger.fatal("Adios muchachos");
                process.exit(1);
            }).start(2000);
        };
        this.subscription = container_1.Container.get(subscription_1.Subscription).createFromPredicate(subscriptionAttributes);
        this.startTime = new date_controller_1.DateController();
        this.report = {
            valid: false,
            errorsDescription: []
        };
    }
    onTimeout(onTimeOutCallback) {
        this.timeOut = new timeout_1.Timeout(() => {
            const message = `Subscription '${this.subscription.type}' stop waiting because it has timed out`;
            logger_1.Logger.info(message);
            this.cleanUp();
            this.hasTimedOut = true;
            this.report.errorsDescription.push(message);
            onTimeOutCallback();
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => {
                this.report = Object.assign({}, this.report, { connectionTime: new date_controller_1.DateController().toString() });
                resolve();
                process.on('SIGINT', this.handleKillSignal);
                process.on('SIGTERM', this.handleKillSignal);
            })
                .catch((err) => {
                const message = `Subscription '${this.subscription.type}' is unable to connect: ${err}`;
                this.report.errorsDescription.push(message);
                reject(err);
            });
        });
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.initializeTimeout();
            this.subscription.receiveMessage()
                .then((message) => {
                logger_1.Logger.debug(`Subscription ${this.subscription.type} received its message: ${message}`);
                if (!this.hasTimedOut) {
                    this.subscription.messageReceived = message;
                    this.executeSubscriptionFunction();
                    logger_1.Logger.info("Subscription stop waiting because it has already received its message");
                }
                this.cleanUp();
                resolve();
            })
                .catch((err) => {
                const message = `Subscription '${this.subscription.type}' is unable to receive message: ${err}`;
                this.report.errorsDescription.push(message);
                this.subscription.unsubscribe();
                reject(err);
            });
        });
    }
    getReport() {
        this.cleanUp();
        this.report = Object.assign({}, this.report, { subscription: this.subscription, hasReceivedMessage: this.subscription.messageReceived != null, hasTimedOut: this.hasTimedOut });
        const hasReceivedMessage = this.report.hasReceivedMessage;
        if (!hasReceivedMessage)
            this.report.errorsDescription.push(`Subscription '${this.subscription.type}' didn't receive any message`);
        this.report.valid = hasReceivedMessage &&
            !this.hasTimedOut &&
            this.report.functionReport.failingTests.length <= 0;
        return this.report;
    }
    cleanUp() {
        logger_1.Logger.info(`Unsubscribing subscription ${this.subscription.type}`);
        this.subscription.unsubscribe();
        if (this.timeOut)
            this.timeOut.clear();
    }
    initializeTimeout() {
        if (this.timeOut && this.subscription.timeout) {
            logger_1.Logger.debug(`Setting ${this.subscription.type} subscription timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }
    executeSubscriptionFunction() {
        const onMessageReceivedSubscription = new on_message_received_meta_function_1.OnMessageReceivedMetaFunction(this.subscription);
        const functionResponse = new meta_function_executor_1.MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        logger_1.Logger.debug(`Response of subscription onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        this.report = Object.assign({}, this.report, { functionReport: functionResponse.report, messageReceivedTimestamp: new date_controller_1.DateController().toString() });
    }
}
exports.SubscriptionHandler = SubscriptionHandler;

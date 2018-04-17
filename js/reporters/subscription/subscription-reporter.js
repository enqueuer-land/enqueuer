"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta_function_executor_1 = require("../../meta-functions/meta-function-executor");
const on_message_received_meta_function_1 = require("../../meta-functions/on-message-received-meta-function");
const logger_1 = require("../../loggers/logger");
const date_controller_1 = require("../../timers/date-controller");
const container_1 = require("../../injector/container");
const subscription_1 = require("../../subscriptions/subscription");
const timeout_1 = require("../../timers/timeout");
class SubscriptionReporter {
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
        logger_1.Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = container_1.Container.get(subscription_1.Subscription).createFromPredicate(subscriptionAttributes);
        this.subscriptionAttributes = subscriptionAttributes;
        this.startTime = new date_controller_1.DateController();
        this.report = {
            valid: false,
            errorsDescription: []
        };
    }
    startTimeout(onTimeOutCallback) {
        this.subscription.messageReceived = null;
        if (this.timeOut)
            this.timeOut.clear();
        this.timeOut = new timeout_1.Timeout(() => {
            if (!this.subscription.messageReceived) {
                const message = `Subscription '${this.subscription.type}' stop waiting because it has timed out`;
                logger_1.Logger.info(message);
                this.hasTimedOut = true;
                this.report.errorsDescription.push(message);
                onTimeOutCallback();
            }
            this.cleanUp();
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.trace(`Subscription '${this.subscription.type}' is connecting`);
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
        this.initializeTimeout();
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message) => {
                if (message) {
                    logger_1.Logger.debug(`Subscription '${this.subscription.type}' received its message: ${JSON.stringify(message)}`.substr(0, 100) + "...");
                    if (!this.hasTimedOut) {
                        this.subscription.messageReceived = message;
                        this.executeSubscriptionFunction();
                        logger_1.Logger.info(`Subscription '${this.subscription.type}' stop waiting because it has already received its message`);
                    }
                    this.cleanUp();
                    resolve(message);
                }
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
        this.report = Object.assign({}, this.report, this.subscriptionAttributes, { hasReceivedMessage: this.subscription.messageReceived != null, hasTimedOut: this.hasTimedOut });
        const hasReceivedMessage = this.report.hasReceivedMessage;
        if (!hasReceivedMessage)
            this.report.errorsDescription.push(`Subscription '${this.subscription.type}' didn't receive any message`);
        this.report.valid = hasReceivedMessage &&
            !this.hasTimedOut &&
            this.report.onMessageFunctionReport.failingTests &&
            this.report.onMessageFunctionReport.failingTests.length <= 0;
        this.cleanUp();
        return this.report;
    }
    cleanUp() {
        this.cleanUp = () => { };
        logger_1.Logger.info(`Unsubscribing subscription ${this.subscription.type}`);
        try {
            this.subscription.unsubscribe();
        }
        catch (err) {
            logger_1.Logger.error(err);
        }
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
        let functionResponse = new meta_function_executor_1.MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        logger_1.Logger.trace(`Response of subscription onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        this.report.errorsDescription = this.report.errorsDescription.concat(functionResponse.failingTests);
        if (functionResponse.exception) {
            this.report.errorsDescription.push(functionResponse.exception);
        }
        this.report = Object.assign({}, this.report, { onMessageFunctionReport: functionResponse, messageReceivedTimestamp: new date_controller_1.DateController().toString() });
    }
}
exports.SubscriptionReporter = SubscriptionReporter;

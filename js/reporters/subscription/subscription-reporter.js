"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meta_function_executor_1 = require("../../meta-functions/meta-function-executor");
const on_message_received_meta_function_1 = require("../../meta-functions/on-message-received-meta-function");
const logger_1 = require("../../loggers/logger");
const date_controller_1 = require("../../timers/date-controller");
const subscription_1 = require("../../subscriptions/subscription");
const timeout_1 = require("../../timers/timeout");
const conditional_injector_1 = require("conditional-injector");
const report_compositor_1 = require("../../reports/report-compositor");
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
        this.subscription = conditional_injector_1.Container.subclassesOf(subscription_1.Subscription).create(subscriptionAttributes);
        this.startTime = new date_controller_1.DateController();
        this.reportCompositor = new report_compositor_1.ReportCompositor(this.subscription.name);
    }
    startTimeout(onTimeOutCallback) {
        this.subscription.messageReceived = undefined;
        if (this.timeOut)
            this.timeOut.clear();
        this.timeOut = new timeout_1.Timeout(() => {
            if (!this.subscription.messageReceived) {
                const message = `[${this.subscription.name}] stop waiting because it has timed out`;
                logger_1.Logger.info(message);
                this.hasTimedOut = true;
                onTimeOutCallback();
            }
            this.cleanUp();
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.trace(`[${this.subscription.name}] is connecting`);
            this.subscription.connect()
                .then(() => {
                this.reportCompositor.addInfo({
                    connectionTime: new date_controller_1.DateController().toString()
                });
                resolve();
                process.on('SIGINT', this.handleKillSignal);
                process.on('SIGTERM', this.handleKillSignal);
            })
                .catch((err) => {
                logger_1.Logger.error(`[${this.subscription.name}] is unable to connect: ${err}`);
                this.reportCompositor.addTest("Unable to connect", false);
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
                    logger_1.Logger.debug(`[${this.subscription.name}] received its message: ${JSON.stringify(message)}`.substr(0, 100) + "...");
                    if (!this.hasTimedOut) {
                        this.subscription.messageReceived = message;
                        this.executeSubscriptionFunction();
                        logger_1.Logger.info(`[${this.subscription.name}] stop waiting because it has already received its message`);
                    }
                    this.cleanUp();
                    resolve(message);
                }
            })
                .catch((err) => {
                logger_1.Logger.error(`[${this.subscription.name}] is unable to receive message: ${err}`);
                this.reportCompositor.addTest("Unable to receive message", false);
                this.subscription.unsubscribe();
                reject(err);
            });
        });
    }
    getReport() {
        const hasReceivedMessage = this.subscription.messageReceived != null;
        this.reportCompositor.addTest("Message received", hasReceivedMessage);
        if (hasReceivedMessage)
            this.reportCompositor.addTest("No time out", !this.hasTimedOut);
        this.reportCompositor.addInfo({
            type: this.subscription.type,
            hasReceivedMessage: hasReceivedMessage,
            hasTimedOut: this.hasTimedOut
        });
        this.cleanUp();
        return this.reportCompositor.snapshot();
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
            logger_1.Logger.debug(`[${this.subscription.name}] setting timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }
    executeSubscriptionFunction() {
        const onMessageReceivedSubscription = new on_message_received_meta_function_1.OnMessageReceivedMetaFunction(this.subscription);
        let functionResponse = new meta_function_executor_1.MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        logger_1.Logger.trace(`Response of subscription onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        functionResponse.tests.map((passing) => this.reportCompositor.addTest(passing.name, passing.valid));
        this.reportCompositor.addInfo({
            onMessageFunctionReport: functionResponse,
            messageReceivedTimestamp: new date_controller_1.DateController().toString()
        });
    }
}
exports.SubscriptionReporter = SubscriptionReporter;

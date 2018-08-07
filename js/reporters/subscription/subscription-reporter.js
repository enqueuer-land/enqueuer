"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../loggers/logger");
const date_controller_1 = require("../../timers/date-controller");
const subscription_1 = require("../../subscriptions/subscription");
const timeout_1 = require("../../timers/timeout");
const conditional_injector_1 = require("conditional-injector");
const report_model_1 = require("../../models/outputs/report-model");
const util_1 = require("util");
const tester_executor_1 = require("../../testers/tester-executor");
class SubscriptionReporter {
    constructor(subscriptionAttributes) {
        this.hasTimedOut = false;
        this.handleKillSignal = (signal) => {
            logger_1.Logger.fatal(`Handling kill signal ${signal}`);
            this.cleanUp();
            new timeout_1.Timeout(() => {
                logger_1.Logger.fatal('Adios muchachos');
                process.exit(1);
            }).start(2000);
        };
        logger_1.Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscriptionOriginalAttributes = subscriptionAttributes;
        this.subscription = conditional_injector_1.Container.subclassesOf(subscription_1.Subscription).create(subscriptionAttributes);
        this.startTime = new date_controller_1.DateController();
        this.report = {
            name: subscriptionAttributes.name,
            type: subscriptionAttributes.type,
            tests: {
                'Connected': false,
                'Message received': false
            },
            valid: true
        };
    }
    startTimeout(onTimeOutCallback) {
        this.subscription.messageReceived = undefined;
        if (this.timeOut) {
            this.timeOut.clear();
        }
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
                this.report.connectionTime = new date_controller_1.DateController().toString();
                this.report.tests['Connected'] = true;
                resolve();
                process.on('SIGINT', this.handleKillSignal);
                process.on('SIGTERM', this.handleKillSignal);
            })
                .catch((err) => {
                logger_1.Logger.error(`[${this.subscription.name}] is unable to connect: ${err}`);
                reject(err);
            });
        });
    }
    receiveMessage() {
        this.initializeTimeout();
        return new Promise((resolve, reject) => {
            this.subscription.receiveMessage()
                .then((message) => {
                logger_1.Logger.debug(`[${this.subscription.name}] received its message`);
                if (!util_1.isNullOrUndefined(message)) {
                    logger_1.Logger.debug(`[${this.subscription.name}] message: ${JSON.stringify(message)}`.substr(0, 100) + '...');
                    if (!this.hasTimedOut) {
                        this.subscription.messageReceived = message;
                        this.executeSubscriptionFunction();
                        logger_1.Logger.info(`[${this.subscription.name}] stop waiting because it has received its message`);
                    }
                    this.cleanUp();
                    resolve(message);
                }
                else {
                    logger_1.Logger.warning(`[${this.subscription.name}] message is null or undefined`);
                }
            })
                .catch((err) => {
                logger_1.Logger.error(`[${this.subscription.name}] is unable to receive message: ${err}`);
                this.subscription.unsubscribe();
                reject(err);
            });
        });
    }
    getReport() {
        const hasReceivedMessage = this.subscription.messageReceived != null;
        this.report.tests['Message received'] = hasReceivedMessage;
        if (this.subscription.timeout) {
            this.report.tests['No time out'] = !this.hasTimedOut;
        }
        this.cleanUp();
        this.report.valid = this.report.valid && report_model_1.checkValidation(this.report);
        return this.report;
    }
    cleanUp() {
        this.cleanUp = () => {
            //do nothing
        };
        logger_1.Logger.info(`Unsubscribing subscription ${this.subscription.type}`);
        try {
            this.subscription.unsubscribe();
        }
        catch (err) {
            logger_1.Logger.error(err);
        }
        if (this.timeOut) {
            this.timeOut.clear();
        }
    }
    initializeTimeout() {
        if (this.timeOut && this.subscription.timeout) {
            logger_1.Logger.debug(`[${this.subscription.name}] setting timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }
    executeSubscriptionFunction() {
        if (!this.subscription.messageReceived || !this.subscription.onMessageReceived) {
            return;
        }
        const testExecutor = new tester_executor_1.TesterExecutor(this.subscription.onMessageReceived);
        testExecutor.addArgument('subscription', this.subscriptionOriginalAttributes);
        testExecutor.addArgument('message', this.subscription.messageReceived);
        const tests = testExecutor.execute();
        tests.map((test) => this.report.tests[test.label] = test.valid);
        this.report.messageReceivedTime = new date_controller_1.DateController().toString();
    }
}
exports.SubscriptionReporter = SubscriptionReporter;

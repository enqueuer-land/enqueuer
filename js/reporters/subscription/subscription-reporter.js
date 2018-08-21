"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../loggers/logger");
const date_controller_1 = require("../../timers/date-controller");
const subscription_1 = require("../../subscriptions/subscription");
const timeout_1 = require("../../timers/timeout");
const conditional_injector_1 = require("conditional-injector");
const report_model_1 = require("../../models/outputs/report-model");
const script_executor_1 = require("../../testers/script-executor");
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
        this.startTime = new date_controller_1.DateController();
        this.report = {
            name: subscriptionAttributes.name,
            type: subscriptionAttributes.type,
            tests: [],
            valid: true
        };
        this.executeOnInitFunction(subscriptionAttributes);
        logger_1.Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
        this.subscription = conditional_injector_1.Container.subclassesOf(subscription_1.Subscription).create(subscriptionAttributes);
    }
    startTimeout(onTimeOutCallback) {
        this.subscription.messageReceived = undefined;
        if (this.timeOut) {
            this.timeOut.clear();
        }
        this.timeOut = new timeout_1.Timeout(() => {
            if (!this.subscription.messageReceived) {
                const message = `${this.subscription.name} stopped waiting because it has timed out`;
                logger_1.Logger.info(message);
                this.hasTimedOut = true;
                onTimeOutCallback();
            }
            this.cleanUp();
        });
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.trace(`${this.subscription.name} is subscribing`);
            this.subscription.subscribe()
                .then(() => {
                this.report.connectionTime = new date_controller_1.DateController().toString();
                resolve();
                process.on('SIGINT', this.handleKillSignal);
                process.on('SIGTERM', this.handleKillSignal);
            })
                .catch((err) => {
                logger_1.Logger.error(`${this.subscription.name} is unable to connect: ${err}`);
                reject(err);
            });
        });
    }
    receiveMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initializeTimeout();
            return new Promise((resolve, reject) => {
                this.subscription.receiveMessage()
                    .then((message) => {
                    logger_1.Logger.debug(`${this.subscription.name} received its message`);
                    if (message !== null || message !== undefined) {
                        this.handleMessageArrival(message)
                            .then(() => logger_1.Logger.debug(`${this.subscription.name} handled message arrival`))
                            .then(() => resolve(message));
                    }
                    else {
                        logger_1.Logger.warning(`${this.subscription.name} message is null or undefined`);
                    }
                })
                    .catch((err) => {
                    logger_1.Logger.error(`${this.subscription.name} is unable to receive message: ${err}`);
                    this.subscription.unsubscribe();
                    reject(err);
                });
            });
        });
    }
    getReport() {
        this.addMessageReceivedReport();
        this.addTimeoutReport();
        this.cleanUp();
        this.report.valid = this.report.valid && report_model_1.checkValidation(this.report);
        return this.report;
    }
    handleMessageArrival(message) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.debug(`${this.subscription.name} message: ${JSON.stringify(message)}`.substr(0, 100) + '...');
            if (!this.hasTimedOut) {
                logger_1.Logger.info(`${this.subscription.name} stop waiting because it has received its message`);
                this.subscription.messageReceived = message;
                this.executeOnMessageReceivedFunction();
                if (this.subscription.response) {
                    logger_1.Logger.debug(`Subscription ${this.subscription.type} sending synchronous response`);
                    yield this.subscription.sendResponse();
                }
            }
            else {
                logger_1.Logger.info(`${this.subscription.name} has received message in a unable time`);
            }
            this.cleanUp();
        });
    }
    addMessageReceivedReport() {
        const messageReceivedTestLabel = 'Message received';
        if (this.subscription.messageReceived != null) {
            this.report.tests.push({
                valid: true,
                name: messageReceivedTestLabel,
                description: `Subscription has received its message successfully`
            });
        }
        else {
            this.report.tests.push({
                valid: false,
                name: messageReceivedTestLabel,
                description: `Subscription has not received its message in a valid time`
            });
        }
    }
    addTimeoutReport() {
        if (this.subscription.timeout) {
            const timeoutTest = {
                valid: false,
                name: 'No time out',
                description: `Subscription has timed out`
            };
            if (!this.hasTimedOut) {
                timeoutTest.valid = true;
                timeoutTest.description = 'Subscription has not timed out';
            }
            this.report.tests.push(timeoutTest);
        }
    }
    cleanUp() {
        process.removeListener('SIGINT', this.handleKillSignal);
        process.removeListener('SIGTERM', this.handleKillSignal);
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
            logger_1.Logger.debug(`${this.subscription.name} setting timeout to ${this.subscription.timeout}ms`);
            this.timeOut.start(this.subscription.timeout);
        }
    }
    executeOnInitFunction(subscriptionAttributes) {
        if (subscriptionAttributes.onInit) {
            logger_1.Logger.info(`Executing subscription::onInit hook function`);
            const testExecutor = new script_executor_1.ScriptExecutor(subscriptionAttributes.onInit);
            testExecutor.addArgument('subscription', subscriptionAttributes);
            this.executeHookFunction(testExecutor);
        }
    }
    executeOnMessageReceivedFunction() {
        logger_1.Logger.trace(`${this.subscription.name} executing hook ${this.subscription.type} specific`);
        this.report.tests = this.subscription.onMessageReceivedTests().concat(this.report.tests);
        if (!this.subscription.onMessageReceived) {
            logger_1.Logger.trace(`${this.subscription.name} has no onMessageReceived to be executed`);
            return;
        }
        logger_1.Logger.trace(`${this.subscription.name} executing onMessageReceived`);
        const testExecutor = new script_executor_1.ScriptExecutor(this.subscription.onMessageReceived);
        testExecutor.addArgument('subscription', this.subscription);
        testExecutor.addArgument('message', this.subscription.messageReceived);
        this.executeHookFunction(testExecutor);
        this.report.messageReceivedTime = new date_controller_1.DateController().toString();
    }
    executeHookFunction(testExecutor) {
        const tests = testExecutor.execute();
        this.report.tests = tests.map(test => {
            return { name: test.label, valid: test.valid, description: test.description };
        })
            .concat(this.report.tests);
    }
}
exports.SubscriptionReporter = SubscriptionReporter;

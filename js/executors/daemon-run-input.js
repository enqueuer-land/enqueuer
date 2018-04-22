"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("../subscriptions/subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const runnable_parser_1 = require("../runnables/runnable-parser");
class DaemonRunInput {
    constructor(input) {
        this.type = input.type;
        this.runnableParser = new runnable_parser_1.RunnableParser();
        this.subscription = conditional_injector_1.Container.subclassesOf(subscription_1.Subscription).create(input);
    }
    connect() {
        logger_1.Logger.info(`Connecting to input ${this.type}`);
        return new Promise((resolve, reject) => {
            this.subscription.connect()
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }
    receiveMessage() {
        return new Promise((resolve) => {
            this.subscription.receiveMessage()
                .then((message) => {
                logger_1.Logger.info(`${this.type} got a message`);
                try {
                    resolve(this.runnableParser.parse(message));
                }
                catch (err) {
                    logger_1.Logger.error(`Error parsing runnable ${JSON.stringify(err)}`);
                }
            });
        });
    }
    unsubscribe() {
        this.subscription.unsubscribe();
    }
}
exports.DaemonRunInput = DaemonRunInput;

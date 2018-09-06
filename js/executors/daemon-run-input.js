"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("../subscriptions/subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const requisition_parser_1 = require("../runners/requisition-parser");
//TODO test it
class DaemonRunInput {
    constructor(input) {
        this.type = input.type;
        this.parser = new requisition_parser_1.RequisitionParser();
        this.subscription = conditional_injector_1.Container.subclassesOf(subscription_1.Subscription).create(input);
    }
    getType() {
        return this.type;
    }
    subscribe() {
        logger_1.Logger.info(`Subscribing to input ${this.type}`);
        return new Promise((resolve, reject) => {
            this.subscription.subscribe()
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
                    resolve(this.parser.parse(message));
                }
                catch (err) {
                    logger_1.Logger.error(`Error parsing requisition ${JSON.stringify(err)}`);
                }
            });
        });
    }
    unsubscribe() {
        this.subscription.unsubscribe();
    }
}
exports.DaemonRunInput = DaemonRunInput;

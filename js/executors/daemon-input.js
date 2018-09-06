"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("../subscriptions/subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const requisition_parser_1 = require("../runners/requisition-parser");
const daemon_input_adapter_1 = require("./daemon-run-input-adapters/daemon-input-adapter");
//TODO test it
class DaemonInput {
    constructor(input) {
        this.type = input.type;
        this.parser = new requisition_parser_1.RequisitionParser();
        this.subscription = conditional_injector_1.Container.subclassesOf(subscription_1.Subscription).create(input);
        this.adapter = conditional_injector_1.Container.subclassesOf(daemon_input_adapter_1.DaemonInputAdapter).create(this.type);
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
                .then((payload) => {
                logger_1.Logger.info(`Daemon ${this.type} got bytes`);
                try {
                    const message = this.adapter.adapt(payload);
                    resolve(this.parser.parse(message));
                }
                catch (err) {
                    logger_1.Logger.error(`Error receiving daemon input ${err}`);
                }
            });
        });
    }
    unsubscribe() {
        this.subscription.unsubscribe();
    }
}
exports.DaemonInput = DaemonInput;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_test_executor_1 = require("./event-test-executor");
class OnInitEventExecutor {
    constructor(owner) {
        this.owner = owner;
    }
    execute() {
        logger_1.Logger.trace(`Executing onInit`);
        if (!this.owner.onInit) {
            logger_1.Logger.trace(`No onOnInit to be played here`);
            return [];
        }
        return this.buildEventTestExecutor().execute();
    }
    buildEventTestExecutor() {
        const eventTestExecutor = new event_test_executor_1.EventTestExecutor(this.owner.onInit);
        eventTestExecutor.addArgument(this.owner.name, this.owner.value);
        return eventTestExecutor;
    }
}
exports.OnInitEventExecutor = OnInitEventExecutor;

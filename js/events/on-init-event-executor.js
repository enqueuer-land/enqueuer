"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_asserter_1 = require("./event-asserter");
//TODO test it
class OnInitEventExecutor {
    constructor(name, initializable) {
        this.initializable = initializable;
        this.name = name;
    }
    execute() {
        logger_1.Logger.trace(`Executing onInit`);
        if (!this.initializable.onInit) {
            logger_1.Logger.trace(`No onOnInit to be played here`);
            return [];
        }
        return this.buildEventAsserter().assert().map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
    }
    buildEventAsserter() {
        const eventTestExecutor = new event_asserter_1.EventAsserter(this.initializable.onInit);
        eventTestExecutor.addArgument(this.name, this.initializable);
        return eventTestExecutor;
    }
}
exports.OnInitEventExecutor = OnInitEventExecutor;

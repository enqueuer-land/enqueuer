"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_executor_1 = require("./event-executor");
//TODO test it
class OnInitEventExecutor extends event_executor_1.EventExecutor {
    constructor(name, initializable) {
        super(initializable.onInit);
        this.initializable = initializable;
        this.addArgument(name, this.initializable);
    }
    trigger() {
        logger_1.Logger.trace(`Executing onInit`);
        if (!this.initializable.onInit) {
            logger_1.Logger.trace(`No onOnInit to be played here`);
            return [];
        }
        return this.execute().map(test => {
            return { name: test.label, valid: test.valid, description: test.errorDescription };
        });
    }
}
exports.OnInitEventExecutor = OnInitEventExecutor;

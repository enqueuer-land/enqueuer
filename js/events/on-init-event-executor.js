"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const event_executor_1 = require("./event-executor");
class OnInitEventExecutor extends event_executor_1.EventExecutor {
    constructor(name, initializable) {
        super(initializable.onInit);
        this.initializable = initializable;
        this.addArgument(name, this.initializable);
    }
    trigger() {
        if (!this.initializable.onInit) {
            return [];
        }
        logger_1.Logger.trace(`Executing onInit`);
        return this.execute();
    }
}
exports.OnInitEventExecutor = OnInitEventExecutor;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enqueuer_executor_1 = require("./run-modes/enqueuer-executor");
const logger_1 = require("./loggers/logger");
const conditional_injector_1 = require("conditional-injector");
class EnqueuerStarter {
    constructor(configuration) {
        this.executor = conditional_injector_1.Container.subclassesOf(enqueuer_executor_1.EnqueuerExecutor).create(configuration);
    }
    start() {
        return new Promise((resolve) => {
            this.executor.execute()
                .then((valid) => {
                logger_1.Logger.info(`Hope you had a great time`);
                logger_1.Logger.info('Enqueuer execution is over (' + valid + ')');
                resolve(valid ? 0 : 1);
            })
                .catch((error) => {
                logger_1.Logger.fatal(`Execution error: ${error}`);
                resolve(-1);
            });
        });
    }
}
exports.EnqueuerStarter = EnqueuerStarter;

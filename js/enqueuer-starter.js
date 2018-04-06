"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configurations/configuration");
const container_1 = require("./injector/container");
const enqueuer_executor_1 = require("./executors/enqueuer-executor");
const logger_1 = require("./loggers/logger");
class EnqueuerStarter {
    constructor() {
        const configuration = new configuration_1.Configuration();
        this.executor = container_1.Container.get(enqueuer_executor_1.EnqueuerExecutor).createFromPredicate(configuration.getRequisitionRunMode());
    }
    start() {
        return new Promise(resolve => {
            this.executor.execute()
                .then((report) => {
                report.valid ? resolve(0) : resolve(1);
            })
                .catch((error) => {
                logger_1.Logger.fatal(`Execution error: ${error}`);
                resolve(-1);
            });
        });
    }
}
exports.EnqueuerStarter = EnqueuerStarter;

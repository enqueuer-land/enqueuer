"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_runner_1 = require("./requisition-runner");
class RequisitionStarter {
    constructor(requisition) {
        logger_1.Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new requisition_runner_1.RequisitionRunner(requisition);
    }
    start() {
        return new Promise((resolve) => {
            return this.requisitionRunner.start((requisitionResultReport) => resolve(requisitionResultReport));
        });
    }
}
exports.RequisitionStarter = RequisitionStarter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_runner_1 = require("./requisition-runner");
class RequisitionStarter {
    constructor(requisition) {
        this.requisitionId = requisition.id;
        logger_1.Logger.info(`Starting requisition ${this.requisitionId}`);
        this.requisitionRunner = new requisition_runner_1.RequisitionRunner(requisition);
    }
    start() {
        return new Promise((resolve) => {
            return this.requisitionRunner.start((requisitionResultReport) => {
                logger_1.Logger.info(`Requisition ${this.requisitionId} is over`);
                resolve(requisitionResultReport);
            });
        });
    }
}
exports.RequisitionStarter = RequisitionStarter;

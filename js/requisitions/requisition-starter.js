"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const multi_publisher_1 = require("../publishers/multi-publisher");
const requisition_runner_1 = require("./requisition-runner");
const configuration_1 = require("../configurations/configuration");
class RequisitionStarter {
    constructor(requisition) {
        logger_1.Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new requisition_runner_1.RequisitionRunner(requisition);
        this.multiPublisher = new multi_publisher_1.MultiPublisher(new configuration_1.Configuration().getOutputs());
    }
    start() {
        return new Promise((resolve) => {
            return this.requisitionRunner.start((requisitionResultReport) => {
                logger_1.Logger.info("Requisition is over");
                this.multiPublisher.publish(JSON.stringify(requisitionResultReport))
                    .then(() => {
                    delete this.requisitionRunner;
                    delete this.multiPublisher;
                    return resolve(requisitionResultReport);
                })
                    .catch((err) => {
                    logger_1.Logger.error(err);
                });
            });
        });
    }
}
exports.RequisitionStarter = RequisitionStarter;

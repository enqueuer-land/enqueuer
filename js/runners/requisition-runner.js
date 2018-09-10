"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_reporter_1 = require("../reporters/requisition-reporter");
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const store_1 = require("../configurations/store");
const timeout_1 = require("../timers/timeout");
class RequisitionRunner {
    constructor(requisition) {
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        logger_1.Logger.debug(`Initializing requisition '${requisition.name}'`);
        this.requisitionModel = placeHolderReplacer.addVariableMap(store_1.Store.getData())
            .replace(requisition);
        logger_1.Logger.info(`Starting requisition '${this.requisitionModel.name}'`);
    }
    run() {
        logger_1.Logger.info(`Running requisition '${this.requisitionModel.name}'`);
        return new Promise((resolve) => {
            try {
                this.startRequisition(resolve).start(this.requisitionModel.delay || 0);
            }
            catch (err) {
                logger_1.Logger.error(`Error running requisition '${this.requisitionModel.name}'`);
                const report = this.createRunningError(err);
                resolve(report);
            }
        });
    }
    startRequisition(resolve) {
        return new timeout_1.Timeout(() => {
            const shouldBeSkipped = this.requisitionModel.iterations !== undefined && this.requisitionModel.iterations <= 0;
            if (shouldBeSkipped) {
                logger_1.Logger.info(`Requisition will be skipped: ${this.requisitionModel.iterations}`);
                resolve(this.createSkippedReport());
            }
            else {
                const requisitionReporter = new requisition_reporter_1.RequisitionReporter(this.requisitionModel);
                requisitionReporter.start(() => {
                    const report = requisitionReporter.getReport();
                    logger_1.Logger.info(`Requisition '${this.requisitionModel.name}' is over (${report.valid})`);
                    resolve(report);
                });
            }
        });
    }
    createRunningError(err) {
        return {
            valid: false,
            tests: [{
                    valid: false,
                    name: 'Requisition ran',
                    description: err
                }],
            name: this.requisitionModel.name,
            time: {
                startTime: '',
                endTime: '',
                totalTime: 0
            },
            subscriptions: [],
            startEvent: {}
        };
    }
    createSkippedReport() {
        return {
            valid: true,
            tests: [{
                    valid: true,
                    name: 'Requisition skipped',
                    description: 'There is no iterations set to this requisition'
                }],
            name: this.requisitionModel.name,
            time: {
                startTime: '',
                endTime: '',
                totalTime: 0
            },
            subscriptions: [],
            startEvent: {}
        };
    }
}
exports.RequisitionRunner = RequisitionRunner;

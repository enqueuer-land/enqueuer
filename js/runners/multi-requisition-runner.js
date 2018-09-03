"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_runner_1 = require("./requisition-runner");
const requisition_multiplier_1 = require("./requisition-multiplier");
class MultiRequisitionRunner {
    constructor(requisitions, name = 'file collection') {
        this.requisitions = this.addDefaultNames(requisitions);
        this.report = {
            name: name,
            valid: true,
            tests: [],
            startEvent: {},
            requisitions: []
        };
    }
    run() {
        const promises = this.promisifyRunnableExecutionCall();
        return new Promise((resolve, reject) => {
            this.sequentialRunner(promises)
                .then((reports) => {
                logger_1.Logger.info(`Got requisition 'reports ${this.report.name}`);
                reports.forEach((report) => {
                    this.report.valid = this.report.valid && report.valid;
                    if (this.report.requisitions) {
                        this.report.requisitions.push(report);
                    }
                });
            })
                .then(() => resolve(this.report))
                .catch((err) => {
                logger_1.Logger.error(`Error running sequentially: ${err}`);
                reject(err);
            });
        });
    }
    promisifyRunnableExecutionCall() {
        let requisitions = [];
        this.requisitions
            .forEach(requisition => requisitions = requisitions
            .concat(new requisition_multiplier_1.RequisitionMultiplier(requisition)
            .multiply()));
        //TODO: handle thinks like this: this.requisitions[0].requisitions...
        return requisitions.map((requisition) => () => new requisition_runner_1.RequisitionRunner(requisition).run());
    }
    sequentialRunner(runnableFunctions) {
        return runnableFunctions.reduce((requisitionRan, runPromiseFunction) => {
            return requisitionRan
                .then(result => {
                return runPromiseFunction().then(Array.prototype.concat.bind(result));
            })
                .catch(err => logger_1.Logger.error(`Error running run promise ${err}`));
        }, Promise.resolve([]));
    }
    addDefaultNames(requisitions) {
        return requisitions.map((requisition, index) => {
            if (!requisition.name) {
                requisition.name = `Requisition #${index}`;
            }
            return requisition;
        });
    }
}
exports.MultiRequisitionRunner = MultiRequisitionRunner;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_runner_1 = require("./requisition-runner");
const requisition_multiplier_1 = require("./requisition-multiplier");
//TODO test it
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
        const promises = this.promisifyRequisitionExecutionCall();
        return new Promise((resolve, reject) => {
            this.checkInnerRequisitions()
                .then(() => {
                this.runRequisition(promises, resolve, reject);
            })
                .catch((err) => {
                logger_1.Logger.error(`Error running inner requisitions: ${err}`);
                reject(err);
            });
        });
    }
    runRequisition(promises, resolve, reject) {
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
    }
    checkInnerRequisitions() {
        return Promise.all(this.requisitions.map(requisition => {
            return new Promise(resolve => {
                this.runInnerRequisition(requisition, resolve);
            });
        }));
    }
    runInnerRequisition(requisition, resolve) {
        if (requisition.requisitions && requisition.requisitions.length > 0) {
            logger_1.Logger.info(`Handling inner ${requisition.name} requisitions`);
            const multiRequisitionRunner = new MultiRequisitionRunner(requisition.requisitions, requisition.name);
            multiRequisitionRunner
                .run()
                .then((report) => {
                if (this.report.requisitions) {
                    this.report.requisitions.push(report);
                }
                resolve();
            });
        }
        else {
            resolve();
        }
    }
    promisifyRequisitionExecutionCall() {
        let requisitions = [];
        this.requisitions
            .forEach(requisition => requisitions = requisitions
            .concat(new requisition_multiplier_1.RequisitionMultiplier(requisition)
            .multiply()));
        return requisitions.map((requisition) => () => new requisition_runner_1.RequisitionRunner(requisition).run());
    }
    sequentialRunner(requisitionRunFunctions) {
        return requisitionRunFunctions.reduce((requisitionRan, runPromiseFunction) => {
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

import {Logger} from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionRunner} from './requisition-runner';
import {RequisitionMultiplier} from './requisition-multiplier';

//TODO test it
export class MultiRequisitionRunner {

    private report: output.RequisitionModel;
    private requisitions: input.RequisitionModel[];

    constructor(requisitions: input.RequisitionModel[], name: string = 'file collection') {
        this.requisitions = this.addDefaultNames(requisitions);

        this.report = {
            name: name,
            valid: true,
            tests: [],
            startEvent: {},
            requisitions: []
        };
    }

    public run(): Promise<output.RequisitionModel> {
        const promises = this.promisifyRequisitionExecutionCall();
        return new Promise((resolve, reject) => {
            this.checkInnerRequisitions()
                .then(() => {
                    this.runRequisition(promises, resolve, reject);
                })
                .catch((err: any) => {
                    Logger.error(`Error running inner requisitions: ${err}`);
                    reject(err);
                });
        });
    }

    private runRequisition(promises: (() => Promise<output.RequisitionModel>)[], resolve: any, reject: any) {
        this.sequentialRunner(promises)
            .then((reports: output.RequisitionModel[]) => {
                Logger.info(`Got requisition 'reports ${this.report.name}`);
                reports.forEach((report) => {
                    this.report.valid = this.report.valid && report.valid;
                    if (this.report.requisitions) {
                        this.report.requisitions.push(report);
                    }
                });
            })
            .then(() => resolve(this.report))
            .catch((err: any) => {
                Logger.error(`Error running sequentially: ${err}`);
                reject(err);
            });
    }

    private checkInnerRequisitions(): Promise<{}[]> {
        return Promise.all(this.requisitions.map(requisition => {
            return new Promise(resolve => {
                this.runInnerRequisition(requisition, resolve);
            });
        }));
    }

    private runInnerRequisition(requisition: input.RequisitionModel, resolve: any) {
        if (requisition.requisitions && requisition.requisitions.length > 0) {
            Logger.info(`Handling inner ${requisition.name} requisitions`);
            const multiRequisitionRunner = new MultiRequisitionRunner(requisition.requisitions, requisition.name);
            multiRequisitionRunner
                .run()
                .then((report: output.RequisitionModel) => {
                    if (this.report.requisitions) {
                        this.report.requisitions.push(report);
                    }
                    resolve();
                });
        } else {
            resolve();
        }
    }

    private promisifyRequisitionExecutionCall() {
        let requisitions: input.RequisitionModel[] = [];
        this.requisitions
            .forEach(requisition => requisitions = requisitions
                                                                .concat(new RequisitionMultiplier(requisition)
                                                                                    .multiply()));
        return requisitions.map((requisition: input.RequisitionModel) => () => new RequisitionRunner(requisition).run());
    }

    private sequentialRunner(requisitionRunFunctions: Function[]): Promise<output.RequisitionModel[]> {
        return requisitionRunFunctions.reduce((requisitionRan, runPromiseFunction) => {
            return requisitionRan
                .then(result => {
                    return runPromiseFunction().then(Array.prototype.concat.bind(result));
                })
                .catch(err => Logger.error(`Error running run promise ${err}`));
        }, Promise.resolve([]));
    }

    private addDefaultNames(requisitions: input.RequisitionModel[]) {
        return requisitions.map((requisition, index) => {
            if (!requisition.name) {
                requisition.name = `Requisition #${index}`;
            }
            return requisition;
        });
    }

}
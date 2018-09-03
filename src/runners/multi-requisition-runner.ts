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
        const promises = this.promisifyRunnableExecutionCall();
        return new Promise((resolve, reject) => {
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
        });
    }

    private promisifyRunnableExecutionCall() {
        let requisitions: input.RequisitionModel[] = [];
        this.requisitions
            .forEach(requisition => requisitions = requisitions
                                                                .concat(new RequisitionMultiplier(requisition)
                                                                                    .multiply()));

        //TODO: handle thinks like this: this.requisitions[0].requisitions...

        return requisitions.map((requisition: input.RequisitionModel) => () => new RequisitionRunner(requisition).run());
    }

    private sequentialRunner(runnableFunctions: Function[]): Promise<output.RequisitionModel[]> {
        return runnableFunctions.reduce((requisitionRan, runPromiseFunction) => {
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
import {Logger} from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionRunner} from './requisition-runner';
import {DateController} from '../timers/date-controller';

//TODO test it
export class MultiRequisitionRunner {

    private readonly startTime: DateController;
    private readonly parent: input.RequisitionModel;
    private report: output.RequisitionModel;
    private requisitions: input.RequisitionModel[];

    constructor(requisitions: input.RequisitionModel[], name: string, parent: input.RequisitionModel) {
        this.parent = parent;
        this.requisitions = this.addDefaultNames(requisitions);
        this.startTime = new DateController();
        this.report = {
            name: name,
            valid: true,
            tests: [],
            requisitions: [],
            time: {
                startTime: this.startTime.toString(),
                endTime: this.startTime.toString(),
                totalTime: 0
            }
        };
    }

    public run(): Promise<output.RequisitionModel> {
        Logger.info(`Running requisition: ${this.report.name}`);
        const promises = this.promisifyRequisitionExecutionCall();
        return new Promise((resolve, reject) => this.runRequisition(promises, resolve, reject));
    }

    private runRequisition(promises: (() => Promise<output.RequisitionModel>)[], resolve: any, reject: any) {
        this.sequentialRunner(promises)
            .then((reports: output.RequisitionModel[]) => {
                this.appendReports(reports);
                resolve(this.report);
            })
            .catch((err: any) => {
                Logger.error(`Error running sequentially: ${err}`);
                reject(err);
            });
    }

    private appendReports(reports: output.RequisitionModel[]) {
        Logger.debug(`Got requisitions reports from: ${this.report.name}`);
        reports.forEach((report) => {
            this.report.valid = this.report.valid && report.valid;
            if (this.report.requisitions) {
                this.report.requisitions.push(report);
            }
        });
        if (this.report.time) {
            this.adjustTimeReport();
        }
    }

    private adjustTimeReport() {
        const endDate = new DateController();
        this.report.time = {
            startTime: this.startTime.toString(),
            endTime: endDate.toString(),
            totalTime: endDate.getTime() - this.startTime.getTime()
        };
    }

    private promisifyRequisitionExecutionCall(): (() => Promise<output.RequisitionModel>)[] {
        return this.requisitions.map((requisition: input.RequisitionModel) => () => {
            Logger.debug(`Promisifying '${requisition.name}' requisition`);
            return new RequisitionRunner(requisition, this.parent).run();
        });
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

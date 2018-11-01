import {Logger} from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionRunner} from './requisition-runner';
import {DateController} from '../timers/date-controller';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';

//TODO test it
export class MultiRequisitionRunner {

    private readonly parent: input.RequisitionModel;
    private readonly requisitions: input.RequisitionModel[];
    private report: output.RequisitionModel;

    constructor(requisitions: input.RequisitionModel[], name: string) {
        this.requisitions = this.addDefaultNames(requisitions);
        this.parent = this.createParent(name);
        this.report = RequisitionDefaultReports.createDefaultReport(name);
    }

    public run(): Promise<output.RequisitionModel> {
        Logger.info(`Running requisition: ${this.report.name}`);
        const promises = this.promisifyRequisitionsExecutionCall();
        return new Promise((resolve, reject) => this.runRequisitions(promises, resolve, reject));
    }

    private createParent(filename: string) {
        const parent: any = RequisitionDefaultReports.createDefaultReport(filename);
        parent.requisitions = this.requisitions;
        return parent;
    }

    private runRequisitions(promises: (() => Promise<output.RequisitionModel>)[], resolve: any, reject: any) {
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
        this.adjustTimeReport();
    }

    private adjustTimeReport() {
        if (this.report.time) {
            const endDate = new DateController();
            const startTimeDate = new DateController(new Date(this.report.time.startTime));
            this.report.time.endTime = endDate.toString();
            this.report.time.totalTime = endDate.getTime() - startTimeDate.getTime();
        }
    }

    private promisifyRequisitionsExecutionCall(): (() => Promise<output.RequisitionModel>)[] {
        return this.requisitions.map((requisition: input.RequisitionModel) => () => {
            Logger.debug(`Promisifying '${requisition.name}' requisition. Parent '${this.parent.name}'`);
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

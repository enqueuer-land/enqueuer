import {Logger} from '../loggers/logger';
import {RequisitionReporter} from '../reporters/requisition-reporter';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';
import {Timeout} from '../timers/timeout';
import {RequisitionMultiplier} from './requisition-multiplier';
import {DateController} from '../timers/date-controller';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';
import {FileContentMapCreator} from '../configurations/file-content-map-creator';

export class RequisitionRunner {

    private requisitions: input.RequisitionModel[] = [];
    private name: string;

    public constructor(requisition: input.RequisitionModel) {
        this.name = requisition.name;
        Logger.debug(`Initializing requisition '${requisition.name}'`);
        const items = new RequisitionMultiplier(requisition).multiply();
        if (items.length <= 0) {
            Logger.debug(`No result requisition after iterations evaluation: ${requisition.iterations}`);
        } else {
            this.requisitions = items;
        }
    }

    public run(): Promise<output.RequisitionModel> {
        Logger.info(`Running requisition '${this.name}'`);
        if (this.requisitions.length <= 1) {
            return this.startRequisition(this.requisitions[0]);
        } else {
            return new Promise((resolve) => this.startIterator(RequisitionDefaultReports.createIteratorReport(this.name), resolve));
        }
    }

    private startIterator(iteratorReport: output.RequisitionModel, resolve: any) {
        const requisition = this.requisitions.shift();
        if (!requisition) {
            this.adjustIteratorReportTimeValues(iteratorReport);
            resolve(iteratorReport);
            return;
        }
        try {
            this.startRequisition(requisition).then(report => {
                this.addReport(iteratorReport, report);
                this.startIterator(iteratorReport, resolve);
            });
        } catch (err) {
            Logger.error(`Error running requisition '${requisition.name}'`);
            const report: output.RequisitionModel = RequisitionDefaultReports.createRunningError(requisition.name, err);
            this.addReport(iteratorReport, report);
            this.startIterator(iteratorReport, resolve);
        }
    }

    private addReport(iteratorReport: output.RequisitionModel, report: output.RequisitionModel) {
        if (iteratorReport.requisitions) {
            iteratorReport.requisitions.push(report);
        }
    }

    private adjustIteratorReportTimeValues(iteratorReport: output.RequisitionModel) {
        if (!iteratorReport.requisitions) {
            return;
        }
        const first = iteratorReport.requisitions[0];
        const last = iteratorReport.requisitions[iteratorReport.requisitions.length - 1];
        if (first && first.time && last && last.time) {
            const startTime = new DateController(new Date(first.time.startTime as string));
            const endTime = new DateController(new Date(last.time.endTime as string));
            const totalTime = endTime.getTime() - startTime.getTime();
            iteratorReport.time = {
                startTime: startTime.toString(),
                endTime: endTime.toString(),
                totalTime: totalTime
            };
        }
    }

    private startRequisition(requisition: input.RequisitionModel): Promise<output.RequisitionModel> {
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        const fileMapCreator = new FileContentMapCreator();
        fileMapCreator.createMap(requisition);
        let requisitionModel = placeHolderReplacer
            .addVariableMap(fileMapCreator.getMap())
            .replace(requisition) as input.RequisitionModel;
        requisitionModel = placeHolderReplacer
            .addVariableMap(Store.getData())
            .replace(requisitionModel) as input.RequisitionModel;
        if (this.shouldSkipRequisition(requisition, requisitionModel)) {
            Logger.info(`Requisition will be skipped`);
            return Promise.resolve(RequisitionDefaultReports.createSkippedReport(this.name));
        }
        return this.startRequisitionReporter(requisitionModel);
    }

    private startRequisitionReporter(requisitionModel: input.RequisitionModel): Promise<output.RequisitionModel> {
        return new Promise((resolve) => {
            const requisitionReporter = new RequisitionReporter(requisitionModel);
            new Timeout(() => {

                requisitionReporter.start(() => {
                    const report = requisitionReporter.getReport();
                    Logger.info(`Requisition '${report.name}' is over (${report.valid}) - ${report.time ? report.time.totalTime : 0}ms`);
                    Logger.trace(`Store keys: ${Object.keys(Store.getData()).join('; ')}`);
                    resolve(report);
                });
            }).start(requisitionModel.delay || 0);
        });
    }

    private shouldSkipRequisition(requisition: input.RequisitionModel, requisitionModel: input.RequisitionModel) {
        if (!requisitionModel || !requisition) {
            return true;
        }
        const definedButLessThanZero = (requisitionModel.iterations !== undefined && requisitionModel.iterations <= 0);
        const definedButInvalid = requisitionModel.iterations !== undefined && typeof(requisitionModel.iterations) != 'number';
        return definedButInvalid || definedButLessThanZero;
    }

}

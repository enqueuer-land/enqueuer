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
import {IterationsEvaluator} from './iterations-evaluator';

export class RequisitionRunner {

    private readonly requisitions: input.RequisitionModel[] = [];
    private readonly name: string;
    private readonly parent: input.RequisitionModel;
    private readonly id?: string;

    public constructor(requisition: input.RequisitionModel, parent: input.RequisitionModel) {
        this.parent = parent;
        this.name = requisition.name;
        this.id = requisition.id;
        Logger.info(`Initializing requisition '${requisition.name}'`);
        const items = new RequisitionMultiplier(requisition).multiply();
        if (items.length <= 0) {
            Logger.info(`No result requisition after iterations evaluation: ${requisition.iterations}`);
        } else {
            this.requisitions = items;
        }
    }

    public run(): Promise<output.RequisitionModel> {
        Logger.info(`Running requisition '${this.name}'`);
        if (this.requisitions.length <= 1) {
            return this.startRequisition(this.requisitions[0]);
        } else {
            return new Promise((resolve) => this.startIterator(RequisitionDefaultReports.createIteratorReport(
                {name: this.name, id: this.id}), resolve));
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
            const report: output.RequisitionModel = RequisitionDefaultReports.createRunningError({name: requisition.name, id: this.id}, err);
            this.addReport(iteratorReport, report);
            this.startIterator(iteratorReport, resolve);
        }
    }

    private addReport(iteratorReport: output.RequisitionModel, report: output.RequisitionModel) {
        if (iteratorReport.requisitions) {
            iteratorReport.requisitions.push(report);
        }
        iteratorReport.valid = iteratorReport.valid && report.valid;
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

    private async checkInnerRequisitions(parent: input.RequisitionModel): Promise<output.RequisitionModel[]> {
        if (parent.requisitions && parent.requisitions.length > 0) {
            Logger.info(`Handling inner ${parent.name} requisitions`);
            return await Promise.all(parent.requisitions.map((requisition, index) => {
                requisition.name = requisition.name || `${parent.name} - inner [${index}]`;
                return new RequisitionRunner(requisition, parent).run();
            }));
        } else {
            return [];
        }
    }

    private startRequisition(requisition: input.RequisitionModel): Promise<output.RequisitionModel> {
        if (requisition === undefined) {
            Logger.info(`No requisition to run. Skipping`);
            return Promise.resolve(RequisitionDefaultReports.createSkippedReport({name: this.name, id: this.id}));
        }
        Logger.debug(`Evaluating starting of requisition '${requisition ? requisition.name : 'no requisition'}'`);
        const fileMapCreator = new FileContentMapCreator(requisition);
        let mapReplacedRequisition: any = new JsonPlaceholderReplacer()
            .addVariableMap(fileMapCreator.getMap())
            .replace(requisition) as input.RequisitionModel;
        mapReplacedRequisition = new JsonPlaceholderReplacer()
            .addVariableMap(Store.getData())
            .replace(mapReplacedRequisition) as input.RequisitionModel;
        if (this.shouldSkipRequisition(mapReplacedRequisition)) {
            Logger.info(`Requisition will be skipped`);
            return Promise.resolve(RequisitionDefaultReports.createSkippedReport({name: this.name, id: this.id}));
        }
        mapReplacedRequisition.parent = this.parent;
        Logger.trace(`Requisition runner starting requisition reporter for '${mapReplacedRequisition.name}'`);
        return this.startRequisitionReporter(mapReplacedRequisition);
    }

    private startRequisitionReporter(requisitionModel: input.RequisitionModel): Promise<output.RequisitionModel> {
        return new Promise((resolve) => {
            const requisitionReporter = new RequisitionReporter(requisitionModel);
            new Timeout(() => {
                this.checkInnerRequisitions(requisitionModel)
                    .then((reports: output.RequisitionModel[]) => {
                        requisitionReporter.start(() => {
                            const report = requisitionReporter.getReport();
                            Logger.info(`Requisition '${report.name}' is over (${report.valid}) - ${report.time ? report.time.totalTime : 0}ms`);
                            Logger.trace(`Store keys: ${Object.keys(Store.getData()).join('; ')}`);
                            report.requisitions = reports;
                            resolve(report);
                        });
                    });
            }).start(requisitionModel.delay || 0);
        });
    }

    private shouldSkipRequisition(requisition: input.RequisitionModel) {
        Logger.trace(`Requisition runner evaluating skipping of '${requisition.name}'`);
        return new IterationsEvaluator().evaluate(requisition) <= 0;
    }

}

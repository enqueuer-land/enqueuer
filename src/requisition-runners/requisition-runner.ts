import {Logger} from '../loggers/logger';
import {RequisitionReporter} from '../reporters/requisition-reporter';
import * as input from '../models/inputs/requisition-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';
import {Timeout} from '../timers/timeout';
import {RequisitionMultiplier} from './requisition-multiplier';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';
import {FileContentMapCreator} from '../configurations/file-content-map-creator';
import {IterationsEvaluator} from './iterations-evaluator';
import {SummaryTestOutput} from '../outputs/summary-test-output';
import {ComponentUniqueTagCreator} from '../components/component-unique-tag-creator';
import {Configuration} from '../configurations/configuration';
import {ObjectDecycler} from '../object-parser/object-decycler';

export class RequisitionRunner {

    private readonly requisition?: input.RequisitionModel;
    private readonly name: string;
    private readonly id?: string;
    private readonly level: number;

    public constructor(requisition: input.RequisitionModel, level: number = 0) {
        this.level = level;
        this.name = requisition.name;
        this.id = requisition.id || requisition.name;
        requisition.id = this.id;
        Logger.info(`Initializing requisition '${requisition.name}'`);
        this.requisition = new RequisitionMultiplier(requisition).multiply();
        if (!this.requisition) {
            Logger.info(`No result requisition after iterations evaluation: ${requisition.iterations}`);
        }
    }

    public async run(): Promise<output.RequisitionModel> {
        Logger.info(`Running requisition '${this.name}'`);
        let report;
        if (this.requisition) {
            report = await this.startRequisition();
        } else {
            report = RequisitionDefaultReports.createSkippedReport({name: this.name, id: this.id});
        }
        if (this.level < Configuration.getInstance().getMaxReportLevelPrint()) {
            new SummaryTestOutput(report).print();
        }
        return report;

    }

    private async runChildRequisitions(requisition: input.RequisitionModel): Promise<output.RequisitionModel[]> {
        const children: RequisitionModel[] = requisition.requisitions || [];
        const reports = [];
        Logger.debug(`Handling child '${requisition.name}' requisitions`);
        let index: number = 0;
        for (const child of children) {
            child.parent = requisition;
            child.name = child.name || `${requisition.name} [${index}]`;
            reports.push(await new RequisitionRunner(child, this.level + 1).run());
            ++index;
        }
        return reports;
    }

    private async startRequisition(): Promise<output.RequisitionModel> {
        const mapReplacedRequisition = this.replaceVariables();
        const notRanReport = this.shouldNotRun(mapReplacedRequisition);
        if (!!notRanReport) {
            return Promise.resolve(notRanReport);
        }

        Logger.trace(`Requisition runner starting requisition reporter for '${mapReplacedRequisition.name}'`);
        return await this.startRequisitionReporter(mapReplacedRequisition);
    }

    //TODO extract to class
    private replaceVariables(): input.RequisitionModel {
        const withId = new ComponentUniqueTagCreator().refresh(this.requisition!);
        Logger.debug(`Evaluating variables of requisition '${this.requisition!.name}'`);
        const parentBkp = withId.parent;

        const decycled: input.RequisitionModel = new ObjectDecycler().decycle(withId) as input.RequisitionModel;

        const fileMapCreator = new FileContentMapCreator(decycled);
        const fileReplaced = new JsonPlaceholderReplacer()
            .addVariableMap(fileMapCreator.getMap())
            .replace(decycled) as input.RequisitionModel;
        const storeReplaced = new JsonPlaceholderReplacer()
            .addVariableMap(Store.getData())
            .replace(fileReplaced) as input.RequisitionModel;
        storeReplaced.parent = parentBkp;
        return storeReplaced;
    }

    private shouldNotRun(mapReplacedRequisition: any): output.RequisitionModel | undefined {
        if (this.shouldSkipRequisition(mapReplacedRequisition)) {
            Logger.info(`Requisition will be skipped`);
            return RequisitionDefaultReports.createSkippedReport({name: this.name, id: this.id});
        }
        if (mapReplacedRequisition.ignore) {
            Logger.info(`Requisition will be ignored`);
            return RequisitionDefaultReports.createIgnoredReport({name: this.name, id: this.id});
        }
    }

    private startRequisitionReporter(requisitionModel: input.RequisitionModel): Promise<output.RequisitionModel> {
        return new Promise((resolve) => {
            const requisitionReporter = new RequisitionReporter(requisitionModel);
            new Timeout(() => {
                this.runChildRequisitions(requisitionModel)
                    .then((childrenReport: output.RequisitionModel[]) => {
                        requisitionReporter.start(() => {
                            const report = requisitionReporter.getReport();
                            Logger.info(`Requisition '${report.name}' is over (${report.valid}) - ${report.time ? report.time.totalTime : 0}ms`);
                            Logger.trace(`Store keys: ${Object.keys(Store.getData()).join('; ')}`);
                            report.level = this.level;
                            report.requisitions = childrenReport;
                            report.valid = report.valid && report.requisitions.every((requisitionsReport) => requisitionsReport.valid);
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

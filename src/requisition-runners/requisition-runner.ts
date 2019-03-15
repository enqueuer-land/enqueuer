import {Logger} from '../loggers/logger';
import {RequisitionReporter} from '../reporters/requisition-reporter';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';
import {FileContentMapCreator} from '../configurations/file-content-map-creator';
import {IterationsEvaluator} from './iterations-evaluator';
import {SummaryTestOutput} from '../outputs/summary-test-output';
import {ObjectDecycler} from '../object-parser/object-decycler';
import {Configuration} from '../configurations/configuration';
import {ComponentParentBackupper} from '../components/component-parent-backupper';

//TODO test it
export class RequisitionRunner {

    private readonly level: number;
    private requisition: input.RequisitionModel;

    public constructor(requisition: input.RequisitionModel, level: number = 0) {
        this.level = level || 0;
        this.requisition = requisition;
    }

    public async run(): Promise<output.RequisitionModel[]> {
        Logger.info(`Running requisition '${this.requisition.name}'`);
        this.replaceVariables();
        const evaluatedIterations: number = new IterationsEvaluator().iterations(this.requisition.iterations);
        if (evaluatedIterations > 0 && !this.requisition.ignore) {
            return await this.iterateRequisition(evaluatedIterations);
        }
        let report: output.RequisitionModel;
        if (evaluatedIterations <= 0) {
            Logger.info(`Requisition will be skipped duo no iterations`);
            report = RequisitionDefaultReports.createSkippedReport({name: this.requisition.name, id: this.requisition.id});
        } else { //if (this.requisition.ignore);
            Logger.info(`Requisition will be ignored`);
            report = RequisitionDefaultReports.createIgnoredReport({name: this.requisition.name, id: this.requisition.id});
        }
        this.printReport(report);
        return [report];
    }

    private async iterateRequisition(evaluatedIterations: number) {
        const reports = [];
        for (let iteration = 0; iteration < evaluatedIterations; ++iteration) {
            try {
                this.replaceVariables();
                Logger.trace(`Requisition runner starting requisition reporter for '${this.requisition.name}'`);
                const report = await this.startRequisitionReporter();
                if (evaluatedIterations > 1) {
                    report.name += ` [${iteration}]`;
                }
                reports.push(report);
                this.printReport(report);
            } catch (err) {
                reports.push(RequisitionDefaultReports.createRunningError({name: this.requisition.name, id: this.requisition.id}, err));
                Logger.error(err);
            }
        }
        return reports;
    }

    private printReport(report: output.RequisitionModel) {
        const configuration = Configuration.getInstance();
        if (this.level <= configuration.getMaxReportLevelPrint()) {
            const summaryOptions = {maxLevel: configuration.getMaxReportLevelPrint(), level: this.level, printFailingTests: false};
            new SummaryTestOutput(report, summaryOptions).print();
        }
    }

    private replaceVariables(): void {
        Logger.debug(`Evaluating variables of requisition '${this.requisition.name}'`);
        const componentParentBackupper = new ComponentParentBackupper();
        componentParentBackupper.removeParents(this.requisition);
        const decycled: input.RequisitionModel = new ObjectDecycler().decycle(this.requisition) as input.RequisitionModel;
        const fileMapCreator = new FileContentMapCreator(decycled);
        const fileReplaced = new JsonPlaceholderReplacer()
            .addVariableMap(fileMapCreator.getMap())
            .replace(decycled) as input.RequisitionModel;
        this.requisition = new JsonPlaceholderReplacer()
            .addVariableMap(Store.getData())
            .replace(fileReplaced) as input.RequisitionModel;
        componentParentBackupper.putParentsBack(this.requisition);
    }

    private async startRequisitionReporter(): Promise<output.RequisitionModel> {
        const requisitionReporter = new RequisitionReporter(this.requisition);
        const report = await Promise.race([requisitionReporter.startTimeout(), this.happyPath(requisitionReporter)]);

        Logger.info(`Requisition '${report.name}' is over (${report.valid}) - ${report.time ? report.time.totalTime : 0}ms`);
        Logger.trace(`Store keys: ${Object.keys(Store.getData()).join('; ')}`);

        return report;
    }

    private async happyPath(requisitionReporter: RequisitionReporter): Promise<output.RequisitionModel> {
        await requisitionReporter.delay();
        Logger.debug(`Handling requisitions children of '${this.requisition.name}'`);
        let childrenReport: output.RequisitionModel[] = await this.executeChildren();
        const report = await requisitionReporter.execute();
        report.requisitions = childrenReport;
        report.valid = report.valid && report.requisitions.every((requisitionsReport) => requisitionsReport.valid);
        Logger.debug(`Requisition ${this.requisition.name} went through the happy path`);
        return report;
    }

    private async executeChildren(): Promise<output.RequisitionModel[]> {
        if (this.requisition.parallel) {
            const models = await Promise.all(this.requisition.requisitions
                .map(async (child: input.RequisitionModel, index: number) => {
                    return await this.executeChild(child, index);
                }));
            return models.reduce((acc, child) => acc.concat(child), []);
        } else {
            let childrenReport: output.RequisitionModel[] = [];
            let index = 0;
            for (const child of this.requisition.requisitions) {
                childrenReport = childrenReport.concat(await this.executeChild(child, index));
                ++index;
            }
            return childrenReport;
        }
    }

    private async executeChild(child: input.RequisitionModel, index: number) {
        child.parent = this.requisition;
        const requisitionRunner = new RequisitionRunner(child, this.level + 1);
        const requisitionModels = await requisitionRunner.run();
        this.requisition.requisitions[index] = requisitionRunner.requisition;
        return requisitionModels;
    }
}

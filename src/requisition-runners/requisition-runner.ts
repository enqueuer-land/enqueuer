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
import {Configuration} from '../configurations/configuration';
import {ComponentParentBackupper} from '../components/component-parent-backupper';
import {ComponentImporter} from './component-importer';
import {reportModelIsPassing} from '../models/outputs/report-model';
import {RequisitionAdopter} from '../components/requisition-adopter';
import {NotificationEmitter, Notifications} from '../notifications/notification-emitter';

//TODO test it
export class RequisitionRunner {

    private readonly level: number;
    private requisition: input.RequisitionModel;

    public constructor(requisition: input.RequisitionModel, level: number = 0) {
        this.level = level || 0;
        this.requisition = new RequisitionAdopter(requisition).getRequisition();
    }

    public async run(): Promise<output.RequisitionModel[]> {
        Logger.info(`Running requisition '${this.requisition.name}'`);
        try {
            this.importRequisition();
        } catch (err) {
            Logger.error(`Error importing requisition`);
            const report = RequisitionDefaultReports.createRunningError({name: this.requisition.name, id: this.requisition.id}, err);
            this.printReport(report);
            return [report];
        }
        this.replaceVariables();
        const evaluatedIterations: number = new IterationsEvaluator().iterations(this.requisition.iterations);
        if (evaluatedIterations <= 0) {
            Logger.info(`Requisition will be skipped duo no iterations`);
            const report = RequisitionDefaultReports.createSkippedReport({name: this.requisition.name, id: this.requisition.id});
            this.printReport(report);
            return [report];
        } else if (this.requisition.ignore) {
            Logger.info(`Requisition will be ignored`);
            const report = RequisitionDefaultReports.createIgnoredReport({name: this.requisition.name, id: this.requisition.id});
            this.printReport(report);
            return [report];
        }
        return await this.iterateRequisition(evaluatedIterations);
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
                report.iteration = iteration;
                reports.push(report);
                this.printReport(report);
            } catch (err) {
                reports.push(RequisitionDefaultReports.createRunningError({name: this.requisition.name, id: this.requisition.id}, err.toString()));
                Logger.error(err);
            }
        }
        return reports;
    }

    private importRequisition() {
        if (this.requisition.import) {
            this.requisition = new ComponentImporter().importRequisition(this.requisition);
        }
    }

    private printReport(report: output.RequisitionModel) {
        NotificationEmitter.emit(Notifications.REQUISITION_RAN, report);
        const configuration = Configuration.getInstance();
        if (this.level <= configuration.getMaxReportLevelPrint()) {
            const summaryOptions = {maxLevel: configuration.getMaxReportLevelPrint(), level: this.level, printFailingTests: this.level === 0};
            try {
                new SummaryTestOutput(report, summaryOptions).print();
            } catch (e) {
                Logger.warning(e);
            }
        }
    }

    private replaceVariables(): void {
        Logger.debug(`Evaluating variables of requisition '${this.requisition.name}'`);
        const componentParentBackupper = new ComponentParentBackupper();
        componentParentBackupper.removeParents(this.requisition);
        const fileMapCreator = new FileContentMapCreator(this.requisition);
        const fileReplaced = new JsonPlaceholderReplacer()
            .addVariableMap(fileMapCreator.getMap())
            .replace(this.requisition);
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
        report.valid = report.valid && report.requisitions.every((requisition) => reportModelIsPassing(requisition));
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

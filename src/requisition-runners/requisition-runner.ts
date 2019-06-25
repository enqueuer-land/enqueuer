import {Logger} from '../loggers/logger';
import {RequisitionReporter} from '../reporters/requisition-reporter';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {Store} from '../configurations/store';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';
import {FileContentMapCreator} from '../configurations/file-content-map-creator';
import {IterationsEvaluator} from './iterations-evaluator';
import {ComponentParentBackupper} from '../components/component-parent-backupper';
import {ComponentImporter} from './component-importer';
import {RequisitionAdopter} from '../components/requisition-adopter';
import {NotificationEmitter, Notifications} from '../notifications/notification-emitter';
import {testModelIsPassing} from '../models/outputs/test-model';

export class RequisitionRunner {

    private requisition: input.RequisitionModel;

    public constructor(requisition: input.RequisitionModel) {
        this.requisition = new RequisitionAdopter(requisition).getRequisition();
    }

    public async run(): Promise<output.RequisitionModel[]> {
        Logger.info(`Running requisition '${this.requisition.name}'`);
        try {
            this.importRequisition();
        } catch (err) {
            Logger.error(`Error importing requisition`);
            const report = RequisitionDefaultReports.createRunningError(this.requisition, err);
            this.emitNotification(report);
            return [report];
        }
        this.replaceVariables();
        const evaluatedIterations: number = new IterationsEvaluator().iterations(this.requisition.iterations);
        if (evaluatedIterations <= 0) {
            Logger.info(`Requisition will be skipped duo no iterations`);
            const report = RequisitionDefaultReports.createSkippedReport(this.requisition);
            this.emitNotification(report);
            return [report];
        } else if (this.requisition.ignore) {
            Logger.info(`Requisition will be ignored`);
            const report = RequisitionDefaultReports.createIgnoredReport(this.requisition);
            this.emitNotification(report);
            return [report];
        }
        return await this.iterateRequisition(evaluatedIterations);
    }

    private async iterateRequisition(iterations: number) {
        const reports = [];
        for (let iterationCounter = 0; iterationCounter < iterations; ++iterationCounter) {
            try {
                this.replaceVariables();
                Logger.trace(`Requisition runner starting requisition reporter for '${this.requisition.name}'`);
                const report = await this.startRequisitionReporter();
                report.iteration = iterationCounter;
                report.totalIterations = iterations;
                reports.push(report);
                this.emitNotification(report);
            } catch (err) {
                reports.push(RequisitionDefaultReports.createRunningError(this.requisition, err.toString()));
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

    private emitNotification(report: output.RequisitionModel) {
        NotificationEmitter.emit(Notifications.REQUISITION_RAN, report);
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
        report.valid = report.valid &&
            report.requisitions.every((requisition) => testModelIsPassing(requisition)) &&
            Object.keys(report.hooks || {}).every((key: string) => report.hooks ? report.hooks[key].valid : true);
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
        const requisitionRunner = new RequisitionRunner(child);
        const requisitionModels = await requisitionRunner.run();
        this.requisition.requisitions[index] = requisitionRunner.requisition;
        return requisitionModels;
    }

}

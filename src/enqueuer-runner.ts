import {Logger} from './loggers/logger';
import {MultiTestsOutput} from './outputs/multi-tests-output';
import * as input from './models/inputs/requisition-model';
import * as output from './models/outputs/requisition-model';
import {DateController} from './timers/date-controller';
import {RequisitionFileParser} from './requisition-runners/requisition-file-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {RequisitionDefaultReports} from './models-defaults/outputs/requisition-default-reports';
import {RequisitionParentCreator} from './components/requisition-parent-creator';
import {Configuration} from './configurations/configuration';
import {SummaryTestOutput} from './outputs/summary-test-output';

export class EnqueuerRunner {
    private static reportName: string = 'enqueuer';

    private readonly startTime: DateController;

    constructor() {
        this.startTime = new DateController();
    }

    public async execute(): Promise<boolean> {
        const requisitionFileParser = new RequisitionFileParser(Configuration.getInstance().getFiles());
        const requisitionModels: input.RequisitionModel[] = requisitionFileParser.parse();
        const parsingErrors = requisitionFileParser.getFilesErrors();
        const enqueuerReport = RequisitionDefaultReports.createDefaultReport({name: EnqueuerRunner.reportName, id: EnqueuerRunner.reportName});
        const parent: input.RequisitionModel = new RequisitionParentCreator().create(EnqueuerRunner.reportName, requisitionModels);
        parent.requisitions!.forEach(child => child.parent = parent);
        if (Configuration.getInstance().isParallel()) {
            enqueuerReport.requisitions = await Promise
                .all(parent.requisitions!
                    .map(async (requisition: any) => await new RequisitionRunner(requisition, 1).run()));
        } else {
            for (const requisition of parent.requisitions!) {
                const requisitionReport = await new RequisitionRunner(requisition, 1).run();
                enqueuerReport.requisitions = enqueuerReport.requisitions!.concat(requisitionReport);
            }
        }
        enqueuerReport.tests = parsingErrors;
        return await this.finishExecution(enqueuerReport);
    }

    private async finishExecution(report: output.RequisitionModel): Promise<boolean> {
        Logger.info('Finishing enqueuer execution');
        this.adjustFinalReport(report);
        const configuration = Configuration.getInstance();
        console.log('     -------------------------');
        new SummaryTestOutput(report, {maxLevel: configuration.getMaxReportLevelPrint()}).print();
        await new MultiTestsOutput(configuration.getOutputs()).execute(report);
        return report.valid;
    }

    private adjustFinalReport(report: output.RequisitionModel) {
        const now = new DateController();
        report.time = {
            startTime: this.startTime.toString(),
            endTime: now.toString(),
            totalTime: now.getTime() - this.startTime.getTime()
        };
        report.valid = (report.requisitions || [])
                .every((child) => child.valid) &&
            (report.tests || [])
                .every((test) => test.valid);
    }
}

import {Logger} from './loggers/logger';
import {MultiTestsOutput} from './outputs/multi-tests-output';
import * as input from './models/inputs/requisition-model';
import * as output from './models/outputs/requisition-model';
import {DateController} from './timers/date-controller';
import {RequisitionFilesParser} from './requisition-runners/requisition-files-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {RequisitionDefaultReports} from './models-defaults/outputs/requisition-default-reports';
import {Configuration} from './configurations/configuration';
import {SummaryTestOutput} from './outputs/summary-test-output';
import {RequisitionAdopter} from './components/requisition-adopter';

export class EnqueuerRunner {
    private static reportName: string = 'enqueuer';

    private readonly startTime: DateController;

    constructor() {
        this.startTime = new DateController();
    }

    public async execute(): Promise<boolean> {
        const requisitionFileParser = new RequisitionFilesParser(Configuration.getInstance().getFiles());
        const requisitions = requisitionFileParser.parse();
        const enqueuerRequisition: input.RequisitionModel = new RequisitionAdopter('enqueuer', {requisitions}).getRequisition();
        const parsingErrors = requisitionFileParser.getFilesErrors();
        const enqueuerReport = RequisitionDefaultReports.createDefaultReport({name: EnqueuerRunner.reportName, id: EnqueuerRunner.reportName});
        if (Configuration.getInstance().isParallel()) {
            const filesReport = await Promise.all(enqueuerRequisition.requisitions
                .map(async (requisition: any) => await new RequisitionRunner(requisition, 1).run()));
            enqueuerReport.requisitions = filesReport.reduce((acc, child) => acc.concat(child), []);
        } else {
            for (const requisition of enqueuerRequisition.requisitions) {
                const requisitionReport = await new RequisitionRunner(requisition, 1).run();
                enqueuerReport.requisitions = enqueuerReport.requisitions.concat(requisitionReport);
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

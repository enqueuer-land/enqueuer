import {Logger} from './loggers/logger';
import {MultiTestsOutput} from './outputs/multi-tests-output';
import * as input from './models/inputs/requisition-model';
import * as output from './models/outputs/requisition-model';
import {DateController} from './timers/date-controller';
import {RequisitionFilePatternParser} from './requisition-runners/requisition-file-pattern-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {Configuration} from './configurations/configuration';
import {RequisitionAdopter} from './components/requisition-adopter';
import {NotificationEmitter, Notifications} from './notifications/notification-emitter';
import {SummaryTestOutput} from './outputs/summary-test-output';
import {PublisherModel} from './models/inputs/publisher-model';
import {TestModel} from './models/outputs/test-model';
import {LogLevel} from './loggers/log-level';

export class EnqueuerRunner {
    private static reportName: string = 'enqueuer';

    private readonly startTime: DateController;
    private enqueuerRequisition?: input.RequisitionModel;

    constructor() {
        this.startTime = new DateController();
        NotificationEmitter.on(Notifications.REQUISITION_RAN, (report: output.RequisitionModel) => EnqueuerRunner.printReport(report));
    }

    public async execute(): Promise<output.RequisitionModel[]> {
        const configuration = Configuration.getInstance();
        Logger.setLoggerLevel(LogLevel.INFO);
        Logger.info('Rocking and rolling');
        Logger.setLoggerLevel(LogLevel.buildFromString(configuration.getLogLevel()));
        const requisitionFileParser = new RequisitionFilePatternParser(configuration.getFiles());
        const requisitions = requisitionFileParser.parse();
        this.enqueuerRequisition = new RequisitionAdopter(
            {
                requisitions,
                name: EnqueuerRunner.reportName,
                timeout: -1,
                parallel: configuration.isParallel()
            }).getRequisition();
        const parsingErrors = requisitionFileParser.getFilesErrors();
        const finalReports = await new RequisitionRunner(this.enqueuerRequisition).run();
        await this.publishReports(configuration.getOutputs(), finalReports, parsingErrors);
        return finalReports;
    }

    private async publishReports(configurationOutputs: PublisherModel[], finalReports: output.RequisitionModel[], parsingErrors: TestModel[]) {
        Logger.info('Publishing reports');
        const valid = parsingErrors.length === 0;
        const outputs = new MultiTestsOutput(configurationOutputs);
        await finalReports.map(async report => {
            report.hooks!.onParsed = {
                valid: valid,
                tests: parsingErrors
            };
            report.valid = report.valid && valid;
            await outputs.publishReport(report);
        });
        return finalReports;
    }

    private static printReport(report: output.RequisitionModel): void {
        const configuration = Configuration.getInstance();
        if (report.level === undefined || report.level <= configuration.getMaxReportLevelPrint()) {
            try {
                let printChildren = true;
                if (report.level === 0) {
                    console.log(`   ----------------`);
                    printChildren = false;
                }

                new SummaryTestOutput(report, {
                    maxLevel: configuration.getMaxReportLevelPrint(),
                    showPassingTests: configuration.getShowPassingTests(),
                    printChildren: printChildren
                }).print();
            } catch (e) {
                Logger.warning(e);
            }
        }

    }

}

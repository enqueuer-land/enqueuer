import {Logger} from './loggers/logger';
import {MultiTestsOutput} from './outputs/multi-tests-output';
import * as input from './models/inputs/requisition-model';
import * as output from './models/outputs/requisition-model';
import {DateController} from './timers/date-controller';
import {RequisitionFilePatternParser} from './requisition-runners/requisition-file-pattern-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {Configuration} from './configurations/configuration';
import {RequisitionAdopter} from './components/requisition-adopter';
import {reportModelIsPassing} from './models/outputs/report-model';

export class EnqueuerRunner {
    private static reportName: string = 'enqueuer';

    private readonly startTime: DateController;
    private enqueuerRequisition?: input.RequisitionModel;

    constructor() {
        this.startTime = new DateController();
    }

    public async execute(): Promise<output.RequisitionModel[]> {
        Logger.info('Let\'s rock');
        const configuration = Configuration.getInstance();
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
        const finalReports = await new RequisitionRunner(this.enqueuerRequisition, 0).run();
        Logger.info('Publishing reports');
        const outputs = new MultiTestsOutput(configuration.getOutputs());
        await finalReports.map(async report => {
            report.tests = parsingErrors;
            report.valid = report.valid && reportModelIsPassing(report);
            await outputs.publishReport(report);
        });
        return finalReports;
    }

    public getEnqueuerRequisition(): input.RequisitionModel | undefined {
        return this.enqueuerRequisition;
    }

}

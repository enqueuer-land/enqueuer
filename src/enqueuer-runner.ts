import {Logger} from './loggers/logger';
import {MultiTestsOutput} from './outputs/multi-tests-output';
import * as input from './models/inputs/requisition-model';
import {DateController} from './timers/date-controller';
import {RequisitionFilePatternParser} from './requisition-runners/requisition-file-pattern-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {Configuration} from './configurations/configuration';
import {RequisitionAdopter} from './components/requisition-adopter';

export class EnqueuerRunner {
    private static reportName: string = 'enqueuer';

    private readonly startTime: DateController;

    constructor() {
        this.startTime = new DateController();
    }

    public async execute(): Promise<boolean> {
        const configuration = Configuration.getInstance();
        const requisitionFileParser = new RequisitionFilePatternParser(configuration.getFiles());
        const requisitions = requisitionFileParser.parse();
        const enqueuerRequisition: input.RequisitionModel = new RequisitionAdopter(
            {
                requisitions,
                name: EnqueuerRunner.reportName,
                timeout: -1,
                parallel: configuration.isParallel()
            }).getRequisition();
        const parsingErrors = requisitionFileParser.getFilesErrors();
        const enqueuerReports = await new RequisitionRunner(enqueuerRequisition, 0).run();
        Logger.info('Publishing reports');
        const publishers = new MultiTestsOutput(configuration.getOutputs());
        await enqueuerReports.map(async report => {
            report.valid = report.valid && report.tests.every(test => test.valid);
            report.tests = parsingErrors;
            await publishers.execute(report);
        });
        return enqueuerReports.every(report => report.valid);
    }

}

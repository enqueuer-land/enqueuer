import {Logger} from './loggers/logger';
import {MultiTestsOutput} from './outputs/multi-tests-output';
import * as glob from 'glob';
import * as input from './models/inputs/requisition-model';
import * as output from './models/outputs/requisition-model';
import {RequisitionModel} from './models/outputs/requisition-model';
import {DateController} from './timers/date-controller';
import {RequisitionFileParser} from './requisition-runners/requisition-file-parser';
import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {RequisitionDefaultReports} from './models-defaults/outputs/requisition-default-reports';
import {RequisitionParentCreator} from './components/requisition-parent-creator';
import {Configuration} from './configurations/configuration';
import {SummaryTestOutput} from './outputs/summary-test-output';

//TODO test it
export class EnqueuerRunner {

    private readonly fileNames: string[];
    private readonly name: string;
    private readonly parallelMode: boolean;
    private readonly errors: RequisitionModel[];
    private readonly startTime: DateController;

    constructor() {
        const configuration = Configuration.getInstance();
        this.startTime = new DateController();
        this.name = configuration.getName();
        this.parallelMode = configuration.isParallel();
        this.errors = [];
        this.fileNames = this.getTestFiles(configuration.getFiles());
    }

    public async execute(): Promise<boolean> {
        if (this.fileNames.length === 0) {
            return Promise.reject(`no test file was found`);
        }

        const parent: input.RequisitionModel = this.createParent(this.fileNames);
        if (this.parallelMode) {
            const requisitionsReport = await Promise
                .all(parent.requisitions!
                    .map(async (requisition: any) => await new RequisitionRunner(requisition, 1).run()));
            const parallelReport = RequisitionDefaultReports.createDefaultReport({name: this.name, id: this.name});
            parallelReport.requisitions = requisitionsReport;
            return await this.finishExecution(parallelReport);
        } else {
            return await this.finishExecution(await new RequisitionRunner(parent).run());
        }
    }

    private getTestFiles(files: string[]): string[] {
        let result: string[] = [];
        files.forEach((pattern: any) => {
            if (typeof (pattern) == 'string') {
                const items = glob.sync(pattern);
                if (items.length <= 0) {
                    Logger.error(`No file was found with: ${pattern}`);
                } else {
                    result = result.concat(items.sort());
                }
            }
        });
        result = [...new Set(result)];

        Logger.info(`Files list: ${JSON.stringify(result, null, 2)}`);
        return result;
    }

    private createParent(files: string[]): input.RequisitionModel {
        const requisitions: input.RequisitionModel[] = [];
        files.forEach(file => {
            try {
                const requisition: input.RequisitionModel = new RequisitionFileParser(file).parse();
                requisitions.push(requisition);
            } catch (err) {
                const message = `Error parsing file ${file}: ${typeof err === 'string' ? err : JSON.stringify(err, null, 2)}`;
                Logger.error(message);
                const error = RequisitionDefaultReports.createRunningError({name: file}, message);
                this.errors.push(error);
            }
        });
        return new RequisitionParentCreator().create(this.name, requisitions);
    }

    private async finishExecution(report: output.RequisitionModel): Promise<boolean> {
        Logger.info('There is no more files to be ran');
        report.requisitions = report.requisitions!.concat(this.errors);
        const now = new DateController();
        report.time = {
            startTime: this.startTime.toString(),
            endTime: now.toString(),
            totalTime: now.getTime() - this.startTime.getTime()
        };
        report.valid = report.requisitions.every((requisitionsReport) => requisitionsReport.valid);
        const configuration = Configuration.getInstance();
        if (this.parallelMode) {
            new SummaryTestOutput(report, configuration.getMaxReportLevelPrint()).print();
        }
        await new MultiTestsOutput(configuration.getOutputs()).execute(report);
        return report.valid;
    }

}

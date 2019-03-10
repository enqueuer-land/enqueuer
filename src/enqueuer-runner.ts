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
import {TestModel} from './models/outputs/test-model';

export class EnqueuerRunner {

    private readonly fileNames: string[];
    private readonly name: string;
    private readonly parallelMode: boolean;
    private readonly filesErrors: TestModel[];
    private readonly startTime: DateController;

    constructor() {
        this.filesErrors = [];
        this.startTime = new DateController();
        const configuration = Configuration.getInstance();
        this.name = configuration.getName();
        this.parallelMode = configuration.isParallel();
        this.fileNames = this.getTestFiles(configuration.getFiles());
    }

    public async execute(): Promise<boolean> {
        if (this.fileNames.length === 0) {
            const message = `no test file was found`;
            await this.finishExecution(RequisitionDefaultReports.createRunningError({name: message}, message));
            return Promise.reject(message);
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

    public getFilesErrors(): TestModel[] {
        return this.filesErrors;
    }

    public getFilesName(): string[] {
        return this.fileNames;
    }

    private getTestFiles(files: string[]): string[] {
        let result: string[] = [];
        files.map((pattern: string) => {
            if (typeof (pattern) == 'string') {
                const items = glob.sync(pattern);
                if (items.length <= 0) {
                    const message = `No file was found with: ${pattern}`;
                    Logger.error(message);
                    this.addError(`File found with ${pattern}`, message);
                } else {
                    result = result.concat(items.sort());
                }
            } else {
                this.addError(`${pattern} is a string`, `File pattern is not a string: ${pattern}`);
            }
        });
        result = [...new Set(result)];

        Logger.info(`Files list: ${JSON.stringify(result, null, 2)}`);
        return result;
    }

    private addError(title: string, message: string) {
        Logger.error(message);
        this.filesErrors.push({name: title, valid: false, description: message});
    }

    private createParent(files: string[]): input.RequisitionModel {
        const requisitions: input.RequisitionModel[] = [];
        files.forEach(file => {
            try {
                requisitions.push(new RequisitionFileParser(file).parse());
            } catch (err) {
                const message = `Error parsing file ${file}: ${typeof err === 'string' ? err : JSON.stringify(err, null, 2)}`;
                Logger.error(message);
                this.addError(`${file} parsed`, message);
            }
        });
        return new RequisitionParentCreator().create(this.name, requisitions);
    }

    private async finishExecution(report: output.RequisitionModel): Promise<boolean> {
        Logger.info('There is no more files to be ran');
        this.adjustFinalReport(report);
        const configuration = Configuration.getInstance();
        if (this.parallelMode) {
            new SummaryTestOutput(report, configuration.getMaxReportLevelPrint()).print();
        }
        await new MultiTestsOutput(configuration.getOutputs()).execute(report);
        return report.valid;
    }

    private adjustFinalReport(report: RequisitionModel) {
        const now = new DateController();
        report.time = {
            startTime: this.startTime.toString(),
            endTime: now.toString(),
            totalTime: now.getTime() - this.startTime.getTime()
        };
        report.tests = this.filesErrors || [];
        report.valid = (report.requisitions || [])
                .every((requisitionsReport) => requisitionsReport.valid) &&
            (report.tests || [])
                .every((test) => test.valid);
    }
}

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
    private static reportName: string = 'enqueuer';

    private readonly fileNames: string[];
    private readonly parallelMode: boolean;
    private readonly filesErrors: TestModel[];
    private readonly startTime: DateController;

    constructor() {
        this.filesErrors = [];
        this.startTime = new DateController();
        const configuration = Configuration.getInstance();
        this.parallelMode = configuration.isParallel();
        this.fileNames = this.getTestFiles(configuration.getFiles());
    }

    public async execute(): Promise<boolean> {
        const parent: input.RequisitionModel = this.createParent(this.fileNames);
        if (this.parallelMode) {
            const requisitionsReport = await Promise
                .all(parent.requisitions!
                    .map(async (requisition: any) => await new RequisitionRunner(requisition, 1).run()));
            const parallelReport = RequisitionDefaultReports.createDefaultReport({name: EnqueuerRunner.reportName, id: EnqueuerRunner.reportName});
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
                    const message = `No file was found with: '${pattern}'`;
                    this.addError(message, message);
                } else {
                    result = result.concat(items.sort());
                }
            } else {
                const message = `File pattern is not a string: '${pattern}'`;
                this.addError(message, message);
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
                const message = `${typeof err === 'string' ? err : JSON.stringify(err, null, 2)}`;
                this.addError(`Error parsing file '${file}'`, message);
            }
        });
        return new RequisitionParentCreator().create(EnqueuerRunner.reportName, requisitions);
    }

    private async finishExecution(report: output.RequisitionModel): Promise<boolean> {
        Logger.info('Finishing enqueuer execution');
        this.adjustFinalReport(report);
        const configuration = Configuration.getInstance();
        console.log('  --------------------');
        new SummaryTestOutput(report, {maxLevel: configuration.getMaxReportLevelPrint()}).print();
        await new MultiTestsOutput(configuration.getOutputs()).execute(report);
        return report.valid;
    }

    private adjustFinalReport(report: RequisitionModel) {
        const now = new DateController();
        report.name = EnqueuerRunner.reportName;
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

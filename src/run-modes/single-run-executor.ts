import {EnqueuerExecutor} from './enqueuer-executor';
import {Logger} from '../loggers/logger';
import {MultiTestsOutput} from '../outputs/multi-tests-output';
import * as glob from 'glob';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {ConfigurationValues} from '../configurations/configuration-values';
import {DateController} from '../timers/date-controller';
import {RequisitionFileParser} from '../requisition-runners/requisition-file-parser';
import {RequisitionRunner} from '../requisition-runners/requisition-runner';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';
import {RequisitionParentCreator} from '../components/requisition-parent-creator';

//TODO test it
export class SingleRunExecutor extends EnqueuerExecutor {

    private readonly fileNames: string[];
    private readonly outputs: MultiTestsOutput;
    private readonly name: string;
    private readonly parallelMode: boolean;
    private readonly errors: RequisitionModel[];
    private readonly startTime: DateController;

    constructor(configuration: ConfigurationValues) {
        super();
        this.startTime = new DateController();
        this.name = configuration.name || 'enqueuer';
        this.parallelMode = configuration.parallel;
        this.errors = [];
        this.fileNames = this.getTestFiles(configuration);
        this.outputs = new MultiTestsOutput(configuration.outputs || []);
    }

    public async execute(): Promise<boolean> {
        if (this.fileNames.length === 0) {
            return Promise.reject(`No test file was found`);
        }

        const parent: input.RequisitionModel = this.createParent(this.fileNames);
        if (this.parallelMode) {
            const requisitionsReport = await Promise
                .all(parent.requisitions!
                    .map(async requisition => await new RequisitionRunner(requisition, 1).run()));
            const parallelReport = RequisitionDefaultReports.createDefaultReport({name: this.name, id: this.name});
            parallelReport.requisitions = requisitionsReport;
            return await this.finishExecution(parallelReport);
        } else {
            return await this.finishExecution(await new RequisitionRunner(parent).run());
        }
    }

    private getTestFiles(configuration: ConfigurationValues): string[] {
        let files: string[] = configuration.addSingleRunIgnore;

        if (files.length == 0) {
            files = configuration.addSingleRun.concat(configuration.files);
        }

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
        Logger.info(`Files list: ${result}`);
        return result;
    }

    private createParent(files: string[]): input.RequisitionModel {
        const requisitions: input.RequisitionModel[] = [];
        files.forEach(file => {
            try {
                const requisition: input.RequisitionModel = new RequisitionFileParser(file).parse();
                requisitions.push(requisition);
            } catch (err) {
                const message = `Error parsing file: ${err}`;
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
        await this.outputs.execute(report);
        return report.valid;
    }

}

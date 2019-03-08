import {EnqueuerExecutor} from './enqueuer-executor';
import {Logger} from '../loggers/logger';
import {MultiTestsOutput} from '../outputs/multi-tests-output';
import * as glob from 'glob';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {ConfigurationValues} from '../configurations/configuration-values';
import {DateController} from '../timers/date-controller';
import {RequisitionFileParser} from '../requisition-runners/requisition-file-parser';
import {RequisitionRunner} from '../requisition-runners/requisition-runner';
import {RequisitionDefaultReports} from '../models-defaults/outputs/requisition-default-reports';
import {TimeModel} from '../models/outputs/time-model';
import {RequisitionParentCreator} from '../requisition-runners/requisition-parent-creator';

//TODO test it
export class SingleRunExecutor extends EnqueuerExecutor {

    private readonly fileNames: string[];
    private readonly outputs: MultiTestsOutput;
    private readonly name: string;
    private readonly parallelMode: boolean;

    constructor(configuration: ConfigurationValues) {
        super();
        this.name = configuration.name || 'single-run';
        this.parallelMode = configuration.parallel;
        this.fileNames = this.getTestFiles(configuration);
        this.outputs = new MultiTestsOutput(configuration.outputs || []);
    }

    public async execute(): Promise<boolean> {
        if (this.fileNames.length === 0) {
            return Promise.reject(`No test file was found`);
        }

        const parent: input.RequisitionModel = this.createParent(this.fileNames);
        if (this.parallelMode) {
            //Create class
            const requisitionsReport = await Promise
                .all(parent.requisitions!
                    .map(async requisition => await new RequisitionRunner(requisition).run()));
            const parallelReport = RequisitionDefaultReports.createDefaultReport({name: this.name, id: this.name});
            parallelReport.requisitions = requisitionsReport;
            parallelReport.valid = parallelReport.requisitions.every((requisitionsReport) => requisitionsReport.valid);
            parallelReport.time = this.adjustIteratorReportTimeValues(requisitionsReport);
            return await this.finishExecution(parallelReport);
        } else {
            const report: output.RequisitionModel = await new RequisitionRunner(parent).run();
            return await this.finishExecution(report);
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

    //TODO class to do thus
    private adjustIteratorReportTimeValues(reports: output.RequisitionModel[]): TimeModel {
        const first = reports[0];
        const last = reports[reports.length - 1];
        if (first && first.time && last && last.time) {
            const startTime = new DateController(new Date(first.time.startTime as string));
            const endTime = new DateController(new Date(last.time.endTime as string));
            const totalTime = endTime.getTime() - startTime.getTime();
            return {
                startTime: startTime.toString(),
                endTime: endTime.toString(),
                totalTime: totalTime
            };
        }
        return {
            startTime: new DateController().toString(),
            endTime: new DateController().toString(),
            totalTime: 0
        };

    }

    private createParent(filename: string[]): input.RequisitionModel {
        const requisitions: input.RequisitionModel[] = [];
        filename.forEach(file => {
            try {
                const requisition: input.RequisitionModel = new RequisitionFileParser(file).parse();
                requisitions.push(requisition);
            } catch (err) {
                Logger.error(`Error parsing file: ${filename}: ${err}`);
            }
        });
        return new RequisitionParentCreator().create(this.name, requisitions);
    }

    private async finishExecution(report: output.RequisitionModel): Promise<boolean> {
        Logger.info('There is no more files to be ran');
        if (report.time) {
            const now = new DateController();
            report.time.endTime = now.toString();
            report.time.totalTime = now.getTime() - new DateController(new Date(report.time.startTime as string)).getTime();
        }
        await this.outputs.execute(report);
        return report.valid;
    }

}

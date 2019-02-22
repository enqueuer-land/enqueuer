import {EnqueuerExecutor} from './enqueuer-executor';
import {Logger} from '../loggers/logger';
import {MultiTestsOutput} from '../outputs/multi-tests-output';
import {RequisitionParser} from '../requisition-runners/requisition-parser';
import * as glob from 'glob';
import * as fs from 'fs';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {MultiRequisitionRunner} from '../requisition-runners/multi-requisition-runner';
import {ConfigurationValues} from '../configurations/configuration-values';
import {SummaryTestOutput} from '../outputs/summary-test-output';
import {DateController} from '../timers/date-controller';

export class SingleRunExecutor extends EnqueuerExecutor {

    private readonly fileNames: string[];
    private readonly parallelMode: boolean;
    private readonly totalFilesNum: number;
    private readonly outputs: MultiTestsOutput;
    private readonly report: output.RequisitionModel;

    constructor(configuration: ConfigurationValues) {
        super();
        this.report = this.initialReport();
        this.parallelMode = configuration.parallel;
        this.fileNames = this.getTestFiles(configuration);
        this.report.name = configuration.name || this.report.name;
        this.outputs = new MultiTestsOutput(configuration.outputs || []);
        this.totalFilesNum = this.fileNames.length;
    }

    public execute(): Promise<boolean> {
        if (this.totalFilesNum == 0) {
            return Promise.reject(`No test file was found`);
        }

        if (this.parallelMode) {
            return this.executeParallelMode();
        } else {
            return this.executeSequentialMode(this.fileNames);
        }
    }

    private initialReport() {
        const now = new DateController().toString();
        return {
            name: 'single-Run',
            valid: true,
            tests: [],
            requisitions: [],
            time: {
                startTime: now,
                endTime: now,
                totalTime: 0
            }
        };
    }

    private executeSequentialMode(fileNames: string[]): Promise<boolean> {
        return new Promise((resolve) => {
            const fileName = fileNames.shift();
            if (fileName) {
                this.runFile(fileName)
                    .then(() => resolve(this.executeSequentialMode(fileNames)));
            } else {
                resolve(this.finishExecution());
            }
        });
    }

    private executeParallelMode(): Promise<boolean> {
        return new Promise((resolve) => {
            Promise.all(this.fileNames
                .map((fileName: string) => this.runFile(fileName)))
                .then(() => resolve(this.finishExecution()));
        });
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
                    this.addTestError(`Test found`, `No file was found with: ${pattern}`);
                } else {
                    result = result.concat(items.sort());
                }
            }
        });
        Logger.info(`Files list: ${result}`);
        return result;
    }

    private addRequisitionReport(test: output.RequisitionModel) {
        if (this.report.requisitions) {
            this.report.requisitions.push(test);
        }
        this.report.valid = this.report.valid && test.valid;
        new SummaryTestOutput(test).print();
    }

    private addTestError(name: string, description: string) {
        Logger.error(`${description}`);
        const test = {name: name, description: description, valid: false};
        if (this.report.requisitions) {
            this.report.tests.push(test);
        }
        this.report.valid = false;
        new SummaryTestOutput({name: this.report.name, tests: [test], valid: false}).print();
    }

    private runFile(filename: string): Promise<void> {
        return new Promise((resolve) => {
            const requisitions: input.RequisitionModel[] | undefined = this.parseFile(filename);
            if (requisitions) {
                new MultiRequisitionRunner(requisitions, filename)
                    .run()
                    .then(report => {
                        this.addRequisitionReport(report);
                        resolve();
                    })
                    .catch((err) => {
                        this.addTestError(`Requisition ran`, `Single-run error reported: ${err}`);
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    private parseFile(fileName: string): input.RequisitionModel[] | undefined {
        try {
            const fileBufferContent = fs.readFileSync(fileName);
            return new RequisitionParser().parse(fileBufferContent.toString());
        } catch (err) {
            this.addTestError(`Requisition parsed`, `Error parsing: ${fileName}: ${err}`);
        }
    }

    private async finishExecution(): Promise<boolean> {
        Logger.info('There is no more files to be ran');
        if (this.report.time) {
            const now = new DateController();
            this.report.time.endTime = now.toString();
            this.report.time.totalTime = now.getTime() - new DateController(new Date(this.report.time.startTime as string)).getTime();
        }
        await this.outputs.execute(this.report);
        return this.report.valid;
    }

}

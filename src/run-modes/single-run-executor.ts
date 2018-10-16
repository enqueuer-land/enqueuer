import {EnqueuerExecutor} from './enqueuer-executor';
import {MultiPublisher} from '../publishers/multi-publisher';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {MultiResultCreator} from './single-run-result-creators/multi-result-creator';
import {RequisitionParser} from '../requisition-runners/requisition-parser';
import * as glob from 'glob';
import * as fs from 'fs';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {MultiRequisitionRunner} from '../requisition-runners/multi-requisition-runner';
import {ConfigurationValues, SingleRunMode} from '../configurations/configuration-values';
import {Json} from '../object-notations/json';

//TODO test it
@Injectable()
export class SingleRunExecutor extends EnqueuerExecutor {

    private readonly fileNames: string[];
    private readonly parallelMode: boolean;
    private readonly totalFilesNum: number;
    private multiPublisher: MultiPublisher;
    private multiResultCreator: MultiResultCreator;

    constructor(configuration: ConfigurationValues) {
        super();
        let singleRunMode: SingleRunMode = configuration['single-run'];
        if (singleRunMode) {
            this.multiResultCreator = new MultiResultCreator(singleRunMode.reportName || singleRunMode.report);
            this.parallelMode = singleRunMode.parallel;
            this.multiPublisher = new MultiPublisher(configuration.outputs);
            this.fileNames = this.getTestFiles(configuration, singleRunMode.files || []);
        } else {
            this.multiResultCreator = new MultiResultCreator();
            this.parallelMode = false;
            this.multiPublisher = new MultiPublisher(configuration.outputs);
            this.fileNames = this.getTestFiles(configuration, []);
        }
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

    private getTestFiles(configuration: ConfigurationValues, singleRunFiles: string[]): string[] {
        let files: string[] = configuration.addSingleRunIgnore;

        if (files.length == 0) {
            files = configuration.addSingleRun.concat(singleRunFiles);
        }

        let result: string[] = [];
        files.forEach((pattern: any) => {
            if (typeof(pattern) == 'string') {
                const items = glob.sync(pattern);
                if (items.length <= 0) {
                    this.sendErrorMessage(`No file was found with: ${pattern}`);
                } else {
                    result = result.concat(items.sort());
                }
            }
        });
        Logger.info(`Files list: ${result}`);
        return result;
    }

    private sendErrorMessage(message: any) {
        Logger.error(message);
        this.multiResultCreator.addError(message);
        this.multiPublisher.publish(message).then().catch(console.log.bind(console));
    }

    private runFile(filename: string): Promise<void> {
        return new Promise((resolve) => {
            const requisitions: RequisitionModel[] | undefined = this.parseFile(filename);
            if (requisitions) {
                new MultiRequisitionRunner(requisitions, filename)
                    .run()
                    .then(report => {
                        this.multiResultCreator.addTestSuite(filename, report);
                        this.multiPublisher.publish(report).catch(console.log.bind(console));
                        resolve();
                    })
                    .catch((err) => {
                        this.sendErrorMessage(`Single-run error reported: ${new Json().stringify(err)}`);
                        resolve();
                    });
            } else {
                resolve();
            }
        });
    }

    private parseFile(fileName: string): RequisitionModel[] | undefined {
        try {
            const fileBufferContent = fs.readFileSync(fileName);
            return new RequisitionParser().parse(fileBufferContent.toString());
        } catch (err) {
            this.sendErrorMessage(`Error parsing: ${fileName}: ` + err);
        }
        return undefined;
    }

    private finishExecution(): boolean {
        Logger.info('There is no more files to be ran');
        this.multiResultCreator.create();
        return this.multiResultCreator.isValid();
    }

}

import {EnqueuerExecutor} from './enqueuer-executor';
import {MultiPublisher} from '../publishers/multi-publisher';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {MultiResultCreator} from '../single-run-result-creators/multi-result-creator';
import {RequisitionParser} from '../runners/requisition-parser';
import * as glob from 'glob';
import * as fs from 'fs';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {MultiRequisitionRunner} from '../runners/multi-requisition-runner';
import {ConfigurationValues} from '../configurations/configuration-values';

//TODO test it
@Injectable({predicate: (configuration: ConfigurationValues) => configuration.runMode && configuration.runMode['single-run'] != null})
export class SingleRunExecutor extends EnqueuerExecutor {

    private fileNames: string[];
    private multiPublisher: MultiPublisher;
    private multiResultCreator: MultiResultCreator;
    private parallelMode: boolean;
    private totalFilesNum: number;

    constructor(configuration: ConfigurationValues) {
        super();
        Logger.info('Executing in Single-Run mode');
        const singleRunMode: any = configuration.runMode['single-run'];
        const singleRunConfiguration = singleRunMode;
        this.multiResultCreator = new MultiResultCreator(singleRunMode.reportName);
        this.parallelMode = !!singleRunMode.parallel;

        this.multiPublisher = new MultiPublisher(configuration.outputs);
        this.fileNames = this.getTestFiles(singleRunConfiguration.files);
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

    private getTestFiles(files: string[]): string[] {
        let result: string[] = [];
        if (files) {
            files.forEach((pattern: string) => {
                const items = glob.sync(pattern);
                if (items.length <= 0) {
                    this.sendErrorMessage(`No file was found with: ${pattern}`);
                } else {
                    result = result.concat(items);
                }
            });
            Logger.info(`Files list: ${result}`);
        }
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
                        this.sendErrorMessage(`Single-run error reported: ${JSON.stringify(err, null, 2)}`);
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
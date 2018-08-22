import {EnqueuerExecutor} from './enqueuer-executor';
import {MultiPublisher} from '../publishers/multi-publisher';
import {Configuration} from '../configurations/configuration';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {RunnableRunner} from '../runnables/runnable-runner';
import {MultiResultCreator} from '../single-run-result-creators/multi-result-creator';
import {RunnableModel} from '../models/inputs/runnable-model';
import {RunnableParser} from '../runnables/runnable-parser';
import * as glob from 'glob';
import * as fs from 'fs';

@Injectable({predicate: runMode => runMode['single-run']})
export class SingleRunExecutor extends EnqueuerExecutor {

    private runnableFileNames: string[];
    private multiPublisher: MultiPublisher;
    private multiResultCreator: MultiResultCreator;
    private parallelMode: boolean;
    private totalFilesNum: number;

    constructor(runMode: any) {
        super();
        Logger.info('Executing in Single-Run mode');
        const singleRunMode: any = runMode['single-run'];
        const singleRunConfiguration = singleRunMode;
        this.multiResultCreator = new MultiResultCreator(singleRunMode.reportName);
        this.parallelMode = !!singleRunMode.parallel;

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.runnableFileNames = this.getTestFiles(singleRunConfiguration.files);
        this.totalFilesNum = this.runnableFileNames.length;
    }

    public execute(): Promise<boolean> {
        if (this.totalFilesNum == 0) {
            return Promise.reject(`No test file was found`);
        }

        if (this.parallelMode) {
            return this.executeParallelMode();
        } else {
            return this.executeSequentialMode(this.runnableFileNames);
        }
    }

    private executeSequentialMode(runnableFileNames: string[]): Promise<boolean> {
        return new Promise((resolve) => {
            const nameIndex = this.totalFilesNum - runnableFileNames.length;
            const fileName = runnableFileNames.shift();
            if (fileName) {
                const runnable: RunnableModel | undefined = this.parseRunnable(fileName);
                if (runnable) {
                    this.runRunnable(fileName, this.setDefaultRunnableName(runnable, nameIndex))
                        .then(() => resolve(this.executeSequentialMode(runnableFileNames)));
                }
            } else {
                resolve(this.finishExecution());
            }
        });
    }

    private executeParallelMode(): Promise<boolean> {
        return new Promise((resolve) => {
            Promise.all(this.runnableFileNames.map((fileName: string, index) => {
                const runnable: RunnableModel | undefined = this.parseRunnable(fileName);
                if (runnable) {
                    return this.runRunnable(fileName, this.setDefaultRunnableName(runnable, index));
                } else {
                    return {};
                }
            })).then(() => resolve(this.finishExecution()));
        });
    }

    private setDefaultRunnableName(runnable: RunnableModel | any, index: number): RunnableModel {
        if (!runnable.name) {
            runnable.name = `Runnable #${index}`;
        }
        return runnable;
    }

    private getTestFiles(files: string[]): string[] {
        let result: string[] = [];
        files.forEach((file: string) => {
            result = result.concat(glob.sync(file));
        });
        Logger.info(`Files list: ${result}`);
        return result;
    }

    private parseRunnable(fileName: string): RunnableModel | undefined {
        try {
            return new RunnableParser().parse(fs.readFileSync(fileName).toString());
        } catch (err) {
            const message = `Error parsing: ${fileName}: ` + err;
            Logger.error(message);
            this.multiResultCreator.addError(message);
            this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
        }
        return undefined;
    }

    private runRunnable(name: string, runnable: RunnableModel) {
        return new Promise((resolve, reject) => {
            new RunnableRunner(runnable)
                .run()
                .then(report => {
                    this.multiResultCreator.addTestSuite(name, report);
                    this.multiPublisher.publish(JSON.stringify(report, null, 2)).catch(console.log.bind(console));
                    resolve();
                })
                .catch((err) => {
                    Logger.error(`Single-run error reported: ${JSON.stringify(err, null, 4)}`);
                    this.multiResultCreator.addError(err);
                    this.multiPublisher.publish(JSON.stringify(err, null, 2)).then().catch(console.log.bind(console));
                    reject();
                });
        });

    }

    private finishExecution(): boolean {
        Logger.info('There is no more requisition to be ran');
        this.multiResultCreator.create();
        return this.multiResultCreator.isValid();
    }

}
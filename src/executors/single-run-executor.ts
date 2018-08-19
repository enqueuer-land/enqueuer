import {EnqueuerExecutor} from './enqueuer-executor';
import {MultiPublisher} from '../publishers/multi-publisher';
import {SingleRunInput} from './single-run-input';
import {Configuration} from '../configurations/configuration';
import {Logger} from '../loggers/logger';
import {Injectable} from 'conditional-injector';
import {RunnableRunner} from '../runnables/runnable-runner';
import {MultiResultCreator} from '../single-run-result-creators/multi-result-creator';
import {RunnableModel} from '../models/inputs/runnable-model';

@Injectable({predicate: runMode => runMode['single-run']})
export class SingleRunExecutor extends EnqueuerExecutor {

    private runnables: RunnableModel[];
    private multiPublisher: MultiPublisher;
    private multiResultCreator: MultiResultCreator;

    constructor(runMode: any) {
        super();
        Logger.info('Executing in Single-Run mode');
        const singleRunConfiguration = runMode['single-run'];
        this.multiResultCreator = new MultiResultCreator(runMode['single-run'].reportName);

        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
        this.runnables = new SingleRunInput(singleRunConfiguration).getRequisitionsRunnables();
    }

    public execute(): Promise<boolean> {
        return new Promise((resolve) => {
            Promise.all(this.runnables.map((runnable: any) => this.runRunnable(runnable)))
                .then(() => {
                    Logger.info('There is no more requisition to be ran');
                    this.multiResultCreator.create();
                    resolve(this.multiResultCreator.isValid());
            });
        });
    }

    private runRunnable(runnable: any) {
        return new Promise((resolve, reject) => {
            new RunnableRunner(runnable.content)
                .run()
                .then(report => {
                    this.multiResultCreator.addTestSuite(runnable.name, report);
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
}
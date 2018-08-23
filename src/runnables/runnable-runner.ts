import {Container, Injectable} from 'conditional-injector';
import {Runner} from './runner';
import {Timeout} from '../timers/timeout';
import {ResultModel} from '../models/outputs/result-model';
import {RunnableModel} from '../models/inputs/runnable-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {Logger} from '../loggers/logger';

@Injectable({predicate: runnable => runnable.runnables})
export class RunnableRunner extends Runner {

    private runnableModel: RunnableModel;
    private report: ResultModel;

    constructor(runnableModel: RunnableModel) {
        super();
        this.runnableModel = runnableModel;

        this.report = {
            type: 'runnable',
            valid: true,
            tests: [],
            name: this.runnableModel.name,
            id: this.runnableModel.id,
            runnables: []
        };
        this.addDefaultName();
    }

    public run(): Promise<ResultModel> {
        const delay = this.runnableModel.delay;
        const promises = this.promisifyRunnableExecutionCall();
        return new Promise((resolve, reject) => {
            if (delay) {
                Logger.info(`Delaying execution for ${delay}ms`);
            }
            new Timeout(() => {
                this.sequentialRunner(promises)
                    .then((reports: ResultModel[]) =>
                        reports.forEach((report) => {
                                this.report.valid = this.report.valid && report.valid;
                                this.report.runnables.push(report);
                            }))
                    .then( () => resolve(this.report))
                    .catch( (err: any) => {
                        Logger.error(`Error running sequentially: ${err}`);
                        reject(err);
                    });
                })
            .start(delay || 0);
        });
    }

    private addDefaultName() {
        let requisitionCounter = 0;
        let runnableCounter = 0;
        this.runnableModel.runnables.map((runnable: any) => {
            if (!runnable.name) {
                if (runnable.runnables) {
                    runnable.name = `Runnable #${runnableCounter++}`;
                } else {
                    runnable.name = `Requisition #${requisitionCounter++}`;
                }
            }
        });
    }

    private promisifyRunnableExecutionCall() {
        return this.multiplyIterations()
                    .map(runnable => () => Container
                        .subclassesOf(Runner)
                        .create(runnable)
                        .run());
    }

    private multiplyIterations() {
        if (!this.runnableModel.iterations) {
            return this.runnableModel.runnables;
        }
        let runnables: (RunnableModel | RequisitionModel)[] = [];
        for (let x = this.runnableModel.iterations; x > 0; --x) {
            const clone: any = this.runnableModel.runnables.map(x => ({ ...x }));
            const items = clone
                .map((item: any) => {
                    item.name = item.name + `[${x}]`;
                    return item;
                });
            runnables = runnables.concat(items);
        }
        return runnables;
    }

    private sequentialRunner(runnableFunctions: Function[]): Promise<ResultModel[]> {
        return runnableFunctions.reduce((runnableRan, runPromiseFunction) => {
                return runnableRan.then(result => runPromiseFunction().then(Array.prototype.concat.bind(result)));
            }, Promise.resolve([]));
    }

}
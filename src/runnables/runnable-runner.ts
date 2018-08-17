import {Container, Injectable} from 'conditional-injector';
import {Runner} from './runner';
import {Timeout} from '../timers/timeout';
import {ResultModel} from '../models/outputs/result-model';
import {RunnableModel} from '../models/inputs/runnable-model';

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
    }

    private sequentialRunner(runnableFunctions: Function[]): Promise<ResultModel[]> {
        return runnableFunctions.reduce(
                        (promise, runPromiseFunction) => promise.then(result => runPromiseFunction().then(Array.prototype.concat.bind(result))),
                        Promise.resolve([]));
    }

    public run(): Promise<ResultModel> {
        const promises = this.runnableModel.runnables
            .map(runnable => () => Container.subclassesOf(Runner).create(runnable).run());

        return new Promise((resolve) => {
            new Timeout(() => {
                this.sequentialRunner(promises)
                    .then((reports: ResultModel[]) =>
                        reports.forEach((report) => {
                            this.report.valid = this.report.valid && report.valid;
                            this.report.runnables.push(report);
                            }))
                    .then( () => resolve(this.report));
                })
            .start(this.runnableModel.delay || 0);
        });
    }

}
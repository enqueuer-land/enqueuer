import {Container, Injectable} from "conditional-injector";
import {Runner} from "./runner";
import {Timeout} from "../timers/timeout";
import {ResultModel} from "../models/outputs/result-model";
import {RunnableModel} from "../models/inputs/runnable-model";

@Injectable({predicate: runnable => runnable.runnables})
export class RunnableRunner extends Runner {

    private runnableModel: RunnableModel;
    private report: ResultModel;

    constructor(runnableModel: RunnableModel) {
        super();
        this.runnableModel = runnableModel;
        this.report = {
            type: "runnable",
            valid: true,
            tests: {},
            name: this.runnableModel.name,
            id: this.runnableModel.id,
            runnables: []
        };
    }

    public run(): Promise<ResultModel> {
        return new Promise((resolve) => {
            new Timeout(() => {
                const promise = Promise.all(this.runnableModel.runnables
                    .map(runnable =>
                        Container.subclassesOf(Runner)
                            .create(runnable)
                            .run()
                            .then((report: ResultModel) => {
                                this.report.valid = this.report.valid && report.valid;
                                this.report.runnables.push(report)
                            })))
                    .then(() => this.report);
                resolve(promise);
            }).start(this.runnableModel.initialDelay || 0);

        })
    }

}
import {Container, Injectable} from "conditional-injector";
import {RunnableModel} from "../models/runnable-model";
import {Runner} from "./runner";
import {Report} from "../reports/report";
import {Timeout} from "../timers/timeout";
import {ReportCompositor} from "../reports/report-compositor";

@Injectable({predicate: runnable => runnable.runnables})
export class RunnableRunner extends Runner {

    private runnableModel: RunnableModel;

    constructor(runnableModel: RunnableModel) {
        super();
        this.runnableModel = runnableModel;
    }

    public run(): Promise<Report> {
        const reportMerger = new ReportCompositor(this.runnableModel.name);
        return new Promise((resolve) => {
            new Timeout(() => {
                const promise = Promise.all(this.runnableModel.runnables
                    .map(runnable =>
                        Container.subclassesOf(Runner)
                            .create(runnable)
                            .run()
                            .then((report: Report) => reportMerger.mergeReport(report))))
                    .then(() => reportMerger.snapshot());
                resolve(promise);
            }).start(this.runnableModel.initialDelay || 0);

        })
    }

}
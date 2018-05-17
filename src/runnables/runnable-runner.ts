import {Container, Injectable} from "conditional-injector";
import {RunnableModel} from "../models/runnable-model";
import {Runner} from "./runner";
import {Report} from "../reports/report";
import {Timeout} from "../timers/timeout";
import {ReportCompositor} from "../reports/report-compositor";

@Injectable({predicate: runnable => runnable.runnables})
export class RunnableRunner extends Runner {

    private runnableModel: RunnableModel;
    private reportCompositor: ReportCompositor;

    constructor(runnableModel: RunnableModel) {
        super();
        this.runnableModel = runnableModel;
        this.reportCompositor = new ReportCompositor(this.runnableModel.name);
        this.reportCompositor.addInfo({id: runnableModel.id});
    }

    public run(): Promise<Report> {
        return new Promise((resolve) => {
            new Timeout(() => {
                const promise = Promise.all(this.runnableModel.runnables
                    .map(runnable =>
                        Container.subclassesOf(Runner)
                            .create(runnable)
                            .run()
                            .then((report: Report) => this.reportCompositor.addSubReport(report))))
                    .then(() => this.reportCompositor.snapshot());
                resolve(promise);
            }).start(this.runnableModel.initialDelay || 0);

        })
    }

}
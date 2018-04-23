import {DaemonRunInput} from "./daemon-run-input";
import {Logger} from "../loggers/logger";
import {MultiPublisher} from "../publishers/multi-publisher";
import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reports/report";
import {Configuration} from "../configurations/configuration";
import {Injectable} from "conditional-injector";
import {RunnableModel} from "../models/runnable-model";
import {RunnableRunner} from "../runnables/runnable-runner";

@Injectable({predicate: enqueuerConfiguration => enqueuerConfiguration["daemon"]})
export class DaemonExecutor extends EnqueuerExecutor{

    private requisitionInputs: DaemonRunInput[];
    private multiPublisher: MultiPublisher;

    public constructor(enqueuerConfiguration: any) {
        super();
        Logger.info("Executing in Daemon mode");
        const configuration = new Configuration();

        this.multiPublisher = new MultiPublisher(configuration.getOutputs());;
        this.requisitionInputs = enqueuerConfiguration["daemon"]
                .map((input: any) => new DaemonRunInput(input));;
    }

    public async init(): Promise<void> {
        return;
    }

    public execute(): Promise<Report> {
        return new Promise(() => {
            this.requisitionInputs
                .forEach((input: DaemonRunInput) => {
                    input.connect()
                        .then(() => {
                            return this.startReader(input)
                        })
                        .catch( (err: string) => {
                            Logger.error(err);
                            input.unsubscribe();
                        });
                });
        })
    }

    private startReader(input: DaemonRunInput) {
        input.receiveMessage()
            .then( (runnable: RunnableModel) => new RunnableRunner(runnable).run())
            .then( (report: Report) => this.multiPublisher.publish(JSON.stringify(report)))
            .then(() => this.startReader(input))
            .catch( (err) => {
                Logger.error(err);
                this.multiPublisher.publish(JSON.stringify(err)).then(() => this.startReader(input));
            })
    }

}
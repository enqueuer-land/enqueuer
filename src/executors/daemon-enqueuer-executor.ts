import {RequisitionStarter} from "../requisitions/requisition-starter";
import {DaemonRequisitionInput} from "../requisitions/daemon-requisition-input";
import {Logger} from "../loggers/logger";
import {RequisitionModel} from "../requisitions/models/requisition-model";
import {MultiPublisher} from "../publishers/multi-publisher";
import {EnqueuerExecutor} from "./enqueuer-executor";
import {Report} from "../reporters/report";
import {Configuration} from "../configurations/configuration";
import {Injectable} from "../injector/injector";

@Injectable(enqueuerConfiguration => enqueuerConfiguration["daemon"])
export class DaemonEnqueuerExecutor extends EnqueuerExecutor{

    private requisitionInputs: DaemonRequisitionInput[];
    private multiPublisher: MultiPublisher;

    public constructor(enqueuerConfiguration: any) {
        super();
        Logger.info("Executing in Daemon mode");
        const configuration = new Configuration();

        this.multiPublisher = new MultiPublisher(configuration.getOutputs());;
        this.requisitionInputs = enqueuerConfiguration["daemon"]
                .map((input: any) => new DaemonRequisitionInput(input));;
    }

    public async init(): Promise<void> {
        return;
    }

    public execute(): Promise<Report> {
        return new Promise(() => {
            this.requisitionInputs
                .forEach((input: DaemonRequisitionInput) => {
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

    private startReader(input: DaemonRequisitionInput) {
        input.receiveMessage()
            .then( (requisition: RequisitionModel) => new RequisitionStarter(requisition).start())
            .then( (report: Report) => this.multiPublisher.publish(JSON.stringify(report)))
            .then(() => this.startReader(input))
            .catch( (err) => {
                Logger.error(err);
                this.multiPublisher.publish(JSON.stringify(err)).then(() => this.startReader(input));
            })
    }

}
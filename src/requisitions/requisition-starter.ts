import {Logger} from "../loggers/logger";
import {MultiPublisher} from "../publishers/multi-publisher";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";
import {Report} from "../reporters/report";
import {Configuration} from "../configurations/configuration";

export class RequisitionStarter {

    private multiPublisher: MultiPublisher;
    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: RequisitionModel) {
        Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new RequisitionRunner(requisition);
        this.multiPublisher = new MultiPublisher(new Configuration().getOutputs());
    }

    public start(): Promise<Report> {
        return new Promise((resolve) => {
            return this.requisitionRunner.start(
                (requisitionResultReport: Report) => {
                    Logger.info("Requisition is over");
                    this.multiPublisher.publish(JSON.stringify(requisitionResultReport))
                        .then(() => {
                            delete this.requisitionRunner;
                            delete this.multiPublisher;
                            return resolve(requisitionResultReport);
                        })
                        .catch((err: any) => {
                            Logger.error(err);
                        })
                });
        });
    }
}


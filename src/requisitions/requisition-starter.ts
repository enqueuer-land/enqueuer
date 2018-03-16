import {Logger} from "../loggers/logger";
import {MultiPublisher} from "../publishers/multi-publisher";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";

export class RequisitionStarter {

    private multiPublisher: MultiPublisher;
    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: RequisitionModel) {
        Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new RequisitionRunner(requisition);
        this.multiPublisher = new MultiPublisher(requisition.reports);
    }

    public start(): void {
        this.requisitionRunner.start(
            (requisitionResultReport: string) => this.onFinish(requisitionResultReport));
    }

    private onFinish(requisitionResultReport: string) {
        Logger.info("Requisition is over");
        this.multiPublisher.publish(requisitionResultReport);

    }
}


import {Logger} from "../loggers/logger";
import {ReportResultReplier} from "../reporters/report-result-replier";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";

export class RequisitionStarter {

    private reportReplier: ReportResultReplier;
    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: RequisitionModel) {
        Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new RequisitionRunner(requisition);
        this.reportReplier = new ReportResultReplier(requisition.reports);
    }

    public start(): void {
        this.requisitionRunner.start(
            (requisitionResultReport: string) => this.onFinish(requisitionResultReport));
    }

    private onFinish(requisitionResultReport: string) {
        Logger.info("Requisition is over");
        this.reportReplier.publish(requisitionResultReport);

    }
}


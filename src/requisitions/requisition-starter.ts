import {Logger} from "../loggers/logger";
import {ReportResultReplier} from "../reporters/report-result-replier";
import {RequisitionRunner} from "./requisition-runner";
import {RequisitionModel} from "./models/requisition-model";
import {PublisherModel} from "./models/publisher-model";

export class RequisitionStarter {

    private requisitionReports: PublisherModel[];
    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: RequisitionModel) {
        Logger.info(`Starting requisition ${requisition.id}`);
        this.requisitionRunner = new RequisitionRunner(requisition);
        this.requisitionReports = requisition.reports;
    }

    public start(): void {
        this.requisitionRunner.start(
            (requisitionResultReport: string) => this.onFinish(requisitionResultReport));
    }

    private onFinish(requisitionResultReport: string) {
        Logger.info("Requisition is over");
        const reportReplier: ReportResultReplier = new ReportResultReplier(this.requisitionReports);
        reportReplier
                .publish(requisitionResultReport);

    }
}


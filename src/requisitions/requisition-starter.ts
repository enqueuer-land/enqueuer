import {Logger} from "../loggers/logger";
import {ReportResultReplier} from "../reporters/report-result-replier";
import {RequisitionRunner} from "./requisition-runner";

export class RequisitionStarter {
    
    private reportReplier: ReportResultReplier;
    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: any) {
        this.reportReplier = new ReportResultReplier(requisition.reports);
        this.requisitionRunner = new RequisitionRunner(requisition);
    }
    
    public start(): void {
        this.requisitionRunner.start((requisitionResultReport: string) => this.onFinish(requisitionResultReport));
    }

    private onFinish(requisitionResultReport: string) {
        Logger.info("Requisition is over");
        this.reportReplier
                .publish(requisitionResultReport);

    }
}


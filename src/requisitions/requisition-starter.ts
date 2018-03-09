import {Logger} from "../loggers/logger";
import {ReportReplier} from "../reporters/reporters-factory";
import {RequisitionRunner} from "./requisition-runner";

export class RequisitionStarter {
    
    private reportReplier: ReportReplier;
    private requisitionRunner: RequisitionRunner;

    public constructor(requisition: any) {
        this.reportReplier = new ReportReplier(requisition.reports);
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


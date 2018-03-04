import { ReportGenerator } from "../report/report-generator";
import { Requisition } from "../requisition/requisition";
import {SubscriptionsHandler} from "./handler/subscriptions-handler";
import {Report} from "../report/report";
import {StartEventTypeHandler} from "./handler/start-event-type-handler";

export type RequisitionStarterCallback = (report: Report) => void;
export class RequisitionStarter {
    private startEventTypeHandler: StartEventTypeHandler;
    private subscriptionsHandler: SubscriptionsHandler;
    private onFinishCallback: RequisitionStarterCallback | null = null;
    private startTime: number = 0;

    constructor(requisition: Requisition) {
        this.startEventTypeHandler = new StartEventTypeHandler(requisition.startEvent);
        this.subscriptionsHandler = new SubscriptionsHandler(requisition.subscriptions);
    }

    public start(onFinishCallback: RequisitionStarterCallback): void {
        this.startTime = Date.now();
        this.onFinishCallback = onFinishCallback;
        this.subscriptionsHandler.start(() => this.onSubscriptionCompleted(),
                                         () => this.onFinish());
    }

    private onSubscriptionCompleted() {
        this.startEventTypeHandler.start()
            .then(() => this.onFinish())
            .catch(err => {
                this.onFinish(err);
            })
    }

    private onFinish(additionalInfo: any = null): void {
        const totalTime = Date.now() - this.startTime;

        let reportGenerator: ReportGenerator = new ReportGenerator();
        if (additionalInfo)
            reportGenerator.addInfo({additionalInfo});
        reportGenerator.addSubscriptionReport(this.subscriptionsHandler.getReports());
        reportGenerator.addStartEventReport(this.startEventTypeHandler.getReport());
        reportGenerator.addInfo({startTime: new Date().toString(), endTime: new Date().toString(), totalTime: totalTime})

        if (this.onFinishCallback)
            this.onFinishCallback(reportGenerator.generate());
    }
}
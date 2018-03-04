import { ReportGenerator } from "../report/report-generator";
import { Requisition } from "../requisition/requisition";
import {SubscriptionsHandler} from "./handler/subscriptions-handler";
import {Report} from "../report/report";
import {StartEventHandler} from "./handler/start-event-handler";

export type RequisitionStarterCallback = (report: Report) => void;
export class RequisitionStarter {
    private startEventHandler: StartEventHandler;
    private subscriptionsHandler: SubscriptionsHandler;
    private onFinishCallback: RequisitionStarterCallback | null = null;
    private startTime: number = 0;

    constructor(requisition: Requisition) {
        this.startEventHandler = new StartEventHandler(requisition.startEvent);
        this.subscriptionsHandler = new SubscriptionsHandler(requisition.subscriptions);
    }

    public start(onFinishCallback: RequisitionStarterCallback): void {
        this.startTime = Date.now();
        this.onFinishCallback = onFinishCallback;
        this.subscriptionsHandler.start(() => this.onSubscriptionsCompleted(),
                                         () => this.onAllSubscriptionsReceivedMessage());
    }

    private onSubscriptionsCompleted() {
        this.startEventHandler.start()
            .then((additionalInfo: any = null) => this.onStartEventTimeout(additionalInfo))
            .catch(err => {
                this.onFinish(err);
            })
    }

    private onStartEventTimeout(additionalInfo: any): void {
        if (this.startTime != 0)
            this.onFinish(additionalInfo);
    }

    private onAllSubscriptionsReceivedMessage(): void {
        console.log("All received messages")
        if (this.startTime != 0)
            this.onFinish();
    }

    private onFinish(additionalInfo: any = null): void {
        const totalTime = Date.now() - this.startTime;

        let reportGenerator: ReportGenerator = new ReportGenerator();
        if (additionalInfo)
            reportGenerator.addInfo({additionalInfo});
        reportGenerator.addSubscriptionReport(this.subscriptionsHandler.getReport());
        reportGenerator.addStartEventReport(this.startEventHandler.getReport());
        reportGenerator.addInfo({startTime: new Date().toString(), endTime: new Date().toString(), totalTime: totalTime})

        if (this.onFinishCallback)
            this.onFinishCallback(reportGenerator.generate());
        this.startTime = 0;
    }
}
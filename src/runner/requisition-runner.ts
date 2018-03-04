import { ReportGenerator } from "../report/report-generator";
import { Requisition } from "../requisition/requisition";
import {MultiSubscriptionsHandler} from "./handler/subscription/multi-subscriptions-handler";
import {Report} from "../report/report";
import {StartEventHandler} from "./handler/start-event/start-event-handler";

export type RequisitionRunnerCallback = (report: Report) => void;
export class RequisitionRunner {
    private startEventHandler: StartEventHandler;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback | null = null;
    private startTime: number = 0;
    private timeout: number | null;

    constructor(requisition: Requisition) {
        this.startEventHandler = new StartEventHandler(requisition.startEvent);
        this.multiSubscriptionsHandler = new MultiSubscriptionsHandler(requisition.subscriptions);
        this.timeout = requisition.timeout;
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        this.startTime = Date.now();
        this.onFinishCallback = onFinishCallback;
        this.multiSubscriptionsHandler.start(() => this.onSubscriptionsCompleted(),
                                         () => this.onAllSubscriptionsStopWaiting());
        this.initializeTimeout();
    }

    private initializeTimeout() {
        if (this.timeout) {
            let timer = global.setTimeout(() => {
                global.clearTimeout(timer);
                console.log("Requisition Timeout");
                if (this.startTime != 0)
                    this.onFinish({requisitionTimedOut: true});
            }, this.timeout);
        }
    }

    private onSubscriptionsCompleted() {
        this.startEventHandler.start()
            .catch(err => {
                this.onFinish(err);
            })
    }

    private onAllSubscriptionsStopWaiting(): void {
        if (this.startTime != 0)
            this.onFinish();
    }

    private onFinish(additionalInfo: any = null): void {
        const totalTime = Date.now() - this.startTime;

        let reportGenerator: ReportGenerator = new ReportGenerator();
        if (additionalInfo)
            reportGenerator.addInfo({additionalInfo});
        reportGenerator.addSubscriptionReport(this.multiSubscriptionsHandler.getReport());
        reportGenerator.addStartEventReport(this.startEventHandler.getReport());
        reportGenerator.addInfo({startTime: new Date().toString(), endTime: new Date().toString(), totalTime: totalTime})

        if (this.onFinishCallback)
            this.onFinishCallback(reportGenerator.generate());
        this.startTime = 0;
    }
}
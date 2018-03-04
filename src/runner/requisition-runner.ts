import { ReportGenerator } from "../report/report-generator";
import { Requisition } from "../requisition/requisition";
import {MultiSubscriptionsHandler} from "./subscription/multi-subscriptions-handler";
import {StartEventHandler} from "./start-event/start-event-handler";

export type RequisitionRunnerCallback = (report: string) => void;
export class RequisitionRunner {
    private startEventHandler: StartEventHandler;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback | null = null;
    private startTime: Date | null = null;
    private timeout: number | null;

    constructor(requisition: Requisition) {
        this.startEventHandler = new StartEventHandler(requisition.startEvent);
        this.multiSubscriptionsHandler = new MultiSubscriptionsHandler(requisition.subscriptions);
        this.timeout = requisition.timeout;
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        console.log("Starting requisition");
        this.startTime = new Date();
        this.onFinishCallback = onFinishCallback;
        this.initializeTimeout();
        this.multiSubscriptionsHandler.connect()
            .then(() => this.onSubscriptionsCompleted())
            .catch(err => this.onFinish(err));
    }

    private onSubscriptionsCompleted() {
        this.multiSubscriptionsHandler.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => this.onFinish(err));

        this.startEventHandler.start()
            .then(() => {
                console.log("Start event has done its job");
            })
            .catch(err => this.onFinish(err));
    }

    private initializeTimeout() {
        if (this.timeout) {
            let timer = global.setTimeout(() => {
                global.clearTimeout(timer);
                console.log("Requisition Timeout");
                if (this.startTime)
                    this.onFinish({requisitionTimedOut: true});
            }, this.timeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        console.log("All subscriptions stopped waiting");
        if (this.startTime)
            this.onFinish();
    }

    private onFinish(additionalInfo: any = null): void {

        let reportGenerator: ReportGenerator = new ReportGenerator();
        if (additionalInfo)
            reportGenerator.addInfo({additionalInfo});
        reportGenerator.addSubscriptionReport(this.multiSubscriptionsHandler.getReport());
        reportGenerator.addStartEventReport(this.startEventHandler.getReport());
        if (this.startTime) {
            const endDate = new Date();
            const totalTime = endDate.getTime() - this.startTime.getTime();
            reportGenerator.addInfo({
                times: {
                    startTime: this.startTime.toString(),
                    endTime: endDate.toString(),
                    totalTime: totalTime}
                });
        }

        if (this.onFinishCallback)
            this.onFinishCallback(reportGenerator.generate().toString());
        this.startTime = null;
    }
}
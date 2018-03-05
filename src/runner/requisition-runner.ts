import { ReportGenerator } from "../report/report-generator";
import {MultiSubscriptionsHandler} from "./subscription/multi-subscriptions-handler";
import {StartEventHandler} from "./start-event/start-event-handler";
import {Logger} from "../log/logger";
import {DateController} from "../date/date-controller";

export type RequisitionRunnerCallback = (report: string) => void;
export class RequisitionRunner {
    private startEventHandler: StartEventHandler;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback | null = null;
    private startTime: DateController | null = null;
    private timeout: number | null;

    constructor(requisitionAttributes: any) {
        this.startEventHandler = new StartEventHandler(requisitionAttributes.startEvent);
        this.multiSubscriptionsHandler = new MultiSubscriptionsHandler(requisitionAttributes.subscriptions);
        this.timeout = requisitionAttributes.timeout;
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        Logger.info("Starting requisition");
        this.startTime = new DateController();
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
                Logger.debug("Start event has done its job");
            })
            .catch(err => this.onFinish(err));
    }

    private initializeTimeout() {
        if (this.timeout) {
            let timer = global.setTimeout(() => {
                global.clearTimeout(timer);
                Logger.info("Requisition Timeout");
                if (this.startTime)
                    this.onFinish({requisitionTimedOut: true});
            }, this.timeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info("All subscriptions stopped waiting");
        if (this.startTime)
            this.onFinish();
    }

    private onFinish(additionalInfo: any = null): void {

        let reportGenerator: ReportGenerator = new ReportGenerator();
        if (additionalInfo)
            reportGenerator.addRequisitionReports({additionalInfo});
        reportGenerator.addSubscriptionReport(this.multiSubscriptionsHandler.getReport());
        reportGenerator.addStartEventReport(this.startEventHandler.getReport());
        if (this.startTime) {
            const endDate = new DateController();
            const totalTime = endDate.getTime() - this.startTime.getTime();
            reportGenerator.addRequisitionReports({
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
import { ReportGenerator } from "../report/report-generator";
import {MultiSubscriptionsHandler} from "../handler/subscription/multi-subscriptions-handler";
import {StartEventHandler} from "../handler/start-event/start-event-handler";
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
                this.onFinish({requisitionTimedOut: true});
            }, this.timeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info("All subscriptions stopped waiting");
        this.onFinish();
    }

    private onFinish(additionalInfo: any = null): void {
        this.onFinish = () => {};

        let reportGenerator: ReportGenerator = new ReportGenerator();
        if (additionalInfo)
            reportGenerator.addRequisitionReports({additionalInfo});
        reportGenerator.addSubscriptionReport(this.multiSubscriptionsHandler.getReport());
        reportGenerator.addStartEventReport(this.startEventHandler.getReport());
        const timesReport = this.generateTimesReport();
        if (timesReport)
            reportGenerator.addRequisitionReports({times:timesReport});
        if (this.onFinishCallback)
            this.onFinishCallback(reportGenerator.generate().toString());
    }

    private generateTimesReport(): {} | null{
        if (this.startTime) {
            let timesReport: any = {};
            const endDate = new DateController();
            timesReport.totalTime = endDate.getTime() - this.startTime.getTime();
            timesReport.startTime = this.startTime.toString();
            timesReport.endTime = endDate.toString();
            if (this.timeout) {
                timesReport.timeout = this.timeout;
                timesReport.hasTimedOut = (timesReport.totalTime > this.timeout);
            }
            return timesReport;
        }
        return null;
    }
}
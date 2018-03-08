import { ReportGenerator } from "../reporters/report-generator";
import {MultiSubscriptionsHandler} from "../handlers/subscription/multi-subscriptions-handler";
import {Logger} from "../loggers/logger";
import {DateController} from "../dates/date-controller";
import {StartEventFactory} from "../start-events/start-event-factory";
import {StartEvent} from "../start-events/start-event";

export type RequisitionRunnerCallback = (report: string) => void;
export class RequisitionRunner {
    private startEvent: StartEvent;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback | null = null;
    private startTime: DateController | null = null;
    private timeout: number | null;

    constructor(requisitionAttributes: any) {
        this.startEvent = new StartEventFactory().createStartEvent(requisitionAttributes.startEvent);
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

        this.startEvent.start()
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
        reportGenerator.addRequisitionReports({
                    enqueuer: {
                        version: process.env.npm_package_version
                    },
                    report: {
                        version: process.env.npm_package_version
                    }
                });

        const multiSubscriptionReport = this.multiSubscriptionsHandler.getReport();
        reportGenerator.addSubscriptionReport(multiSubscriptionReport);
        const startEventReport = this.startEvent.getReport();
        reportGenerator.addStartEventReport(startEventReport);
        let valid = startEventReport.valid && multiSubscriptionReport.valid;
        if (this.timeout && valid && this.startTime)
            valid = (new DateController().getTime() - this.startTime.getTime()) > this.timeout;
        reportGenerator.addRequisitionReports({valid: valid});

        const timesReport = this.generateTimesReport();
        if (timesReport)
            reportGenerator.addRequisitionReports({times:timesReport});
        if (this.onFinishCallback)
            this.onFinishCallback(reportGenerator.generate().toString());
    }

    private generateTimesReport(): {} | null {
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
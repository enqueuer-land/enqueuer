import { ReportGenerator } from "../reporters/report-generator";
import {MultiSubscriptionsHandler} from "../handlers/subscription/multi-subscriptions-handler";
import {Logger} from "../loggers/logger";
import {DateController} from "../dates/date-controller";
import {StartEventFactory} from "../start-events/start-event-factory";
import {StartEvent} from "../start-events/start-event";

export type RequisitionRunnerCallback = (report: string) => void;
export class RequisitionRunner {
    private reportGenerator: ReportGenerator;
    private startEvent: StartEvent;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback | null = null;
    private timeout: number | null;

    constructor(requisitionAttributes: any) {
        this.reportGenerator = new ReportGenerator(requisitionAttributes.id);
        this.startEvent = new StartEventFactory().createStartEvent(requisitionAttributes.startEvent);
        this.multiSubscriptionsHandler = new MultiSubscriptionsHandler(requisitionAttributes.subscriptions);
        this.timeout = requisitionAttributes.timeout;
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        Logger.info("Starting requisition");
        this.reportGenerator.start(this.timeout);
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

        if (additionalInfo)
            this.reportGenerator.addRequisitionReports({additionalInfo});

        const multiSubscriptionReport = this.multiSubscriptionsHandler.getReport();
        this.reportGenerator.setSubscriptionReport(multiSubscriptionReport);
        const startEventReport = this.startEvent.getReport();
        this.reportGenerator.setStartEventReport(startEventReport);
        this.reportGenerator.finish();
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate().toString());
    }
}
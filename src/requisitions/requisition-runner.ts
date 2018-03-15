import { ReportGenerator } from "../reporters/report-generator";
import {MultiSubscriptionsHandler} from "../handlers/subscription/multi-subscriptions-handler";
import {Logger} from "../loggers/logger";
import {StartEventHandler} from "../handlers/start-event/start-event-handler";
import {RequisitionModel} from "./model/requisition-model";
import {Container} from "../injector/container";
import {Timeout} from "../timeouts/timeout";

export type RequisitionRunnerCallback = (report: string) => void;
export class RequisitionRunner {
    private reportGenerator: ReportGenerator;
    private startEvent: StartEventHandler;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback;
    private timeout?: number;

    constructor(requisitionAttributes: RequisitionModel) {
        this.reportGenerator = new ReportGenerator(requisitionAttributes.id);
        this.startEvent = Container.get(StartEventHandler).createFromPredicate(requisitionAttributes.startEvent);
        this.multiSubscriptionsHandler = new MultiSubscriptionsHandler(requisitionAttributes.subscriptions);
        this.timeout = requisitionAttributes.timeout;
        this.onFinishCallback = () => {};
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
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
                this.onFinish();
            }, this.timeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info("All subscriptions stopped waiting");
        this.onFinish();
    }

    private onFinish(error: any = null): void {
        this.onFinish = () => {};

        this.reportGenerator.addError(error);
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsHandler.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback(this.reportGenerator.generate().toString());
    }
}
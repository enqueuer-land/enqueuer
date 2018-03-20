import { ReportGenerator } from "../reporters/report-generator";
import {MultiSubscriptionsHandler} from "../handlers/subscription/multi-subscriptions-handler";
import {Logger} from "../loggers/logger";
import {StartEventHandler} from "../handlers/start-event/start-event-handler";
import {RequisitionModel} from "./models/requisition-model";
import {Container} from "../injector/container";
import {Timeout} from "../timers/timeout";

export type RequisitionRunnerCallback = (report: string) => void;
export class RequisitionRunner {
    private reportGenerator: ReportGenerator;
    private startEvent: StartEventHandler;
    private multiSubscriptionsHandler: MultiSubscriptionsHandler;
    private onFinishCallback: RequisitionRunnerCallback;
    private requisitionTimeout?: number;

    constructor(requisitionAttributes: RequisitionModel) {
        this.reportGenerator = new ReportGenerator(requisitionAttributes.id);
        this.startEvent = Container.get(StartEventHandler).createFromPredicate(requisitionAttributes.startEvent);
        this.multiSubscriptionsHandler = new MultiSubscriptionsHandler(requisitionAttributes.subscriptions);
        this.requisitionTimeout = requisitionAttributes.timeout;
        this.onFinishCallback = () => {};
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        this.reportGenerator.start(this.requisitionTimeout);
        this.onFinishCallback = onFinishCallback;
        this.initializeTimeout();
        this.multiSubscriptionsHandler.connect()
            .then(() => this.onSubscriptionsCompleted())
            .catch(err => {
                Logger.error(`Error connecting multiSubscription: ${err}`)
                this.onFinish(err)
            });
    }

    private onSubscriptionsCompleted() {
        this.multiSubscriptionsHandler.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => {
                Logger.error(`Error receiving message in multiSubscription: ${err}`)
                this.onFinish(err)
            });

        this.startEvent.start()
            .then(() => {
                Logger.debug("Start event has done its job");
            })
            .catch(err => {
                Logger.error(`Error triggering startingEvent: ${err}`)
                this.onFinish(err)
            });
    }

    private initializeTimeout() {
        if (this.requisitionTimeout) {
            new Timeout(() => {
                Logger.info("Requisition Timeout");
                this.onFinish();
            }).start(this.requisitionTimeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info("All subscriptions stopped waiting");
        this.onFinish();
    }

    private onFinish(error: any = null): void {
        this.onFinish = () => {};
        Logger.info(`Start gathering reports`);

        if (error) {
            Logger.warning(`Errors collected: ${error}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsHandler.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback(this.reportGenerator.generate().toString());
    }
}
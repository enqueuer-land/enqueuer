import { ReportGenerator } from "../reporters/report-generator";
import {Logger} from "../loggers/logger";
import {StartEventReporter} from "../reporters/start-event/start-event-reporter";
import {RequisitionModel} from "./models/requisition-model";
import {Container} from "../injector/container";
import {Timeout} from "../timers/timeout";
import {Report} from "../reporters/report";
import {MultiSubscriptionsReporter} from "../reporters/subscription/multi-subscriptions-reporter";

export type RequisitionRunnerCallback = (report: Report) => void;

export class RequisitionRunner {
    private reportGenerator: ReportGenerator;
    private startEvent: StartEventReporter;
    private multiSubscriptionsReporter: MultiSubscriptionsReporter;
    private onFinishCallback: RequisitionRunnerCallback;
    private requisitionTimeout?: number;

    constructor(requisitionAttributes: RequisitionModel) {
        this.reportGenerator = new ReportGenerator(requisitionAttributes.id);
        this.startEvent = Container.get(StartEventReporter).createFromPredicate(requisitionAttributes.startEvent);
        this.multiSubscriptionsReporter = new MultiSubscriptionsReporter(requisitionAttributes.subscriptions);
        this.requisitionTimeout = requisitionAttributes.timeout;
        this.onFinishCallback = () => {};
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        this.reportGenerator.start(this.requisitionTimeout);
        this.onFinishCallback = onFinishCallback;
        this.initializeTimeout();
        this.multiSubscriptionsReporter.connect()
            .then(() => this.onSubscriptionsCompleted())
            .catch(err => {
                Logger.error(`Error connecting multiSubscription: ${err}`)
                this.onFinish(err)
            });
    }

    private onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
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
                this.onFinish("Requisition has timed out");
            }).start(this.requisitionTimeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info("All subscriptions stopped waiting");
        this.onFinish();
    }

    private onFinish(error?: string): void {
        this.onFinish = () => {};
        Logger.info(`Start gathering reports`);

        if (error) {
            Logger.debug(`Error collected: ${error}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback(this.reportGenerator.getReport());
    }
}
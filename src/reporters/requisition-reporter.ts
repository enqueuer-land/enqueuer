import { ReportGenerator } from './report-generator';
import {Logger} from '../loggers/logger';
import {StartEventReporter} from './start-event/start-event-reporter';
import * as input from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {Timeout} from '../timers/timeout';
import {MultiSubscriptionsReporter} from './subscription/multi-subscriptions-reporter';
import {Container} from 'conditional-injector';

export type RequisitionRunnerCallback = () => void;

export class RequisitionReporter {
    private reportGenerator: ReportGenerator;
    private startEvent: StartEventReporter;
    private multiSubscriptionsReporter: MultiSubscriptionsReporter;
    private onFinishCallback: RequisitionRunnerCallback;
    private requisitionTimeout?: number;
    private startEventDoneItsJob = false;
    private allSubscriptionsStoppedWaiting = false;

    constructor(requisitionAttributes: input.RequisitionModel) {
        this.reportGenerator = new ReportGenerator(requisitionAttributes);
        this.startEvent = Container.subclassesOf(StartEventReporter).create(requisitionAttributes.startEvent);
        this.multiSubscriptionsReporter = new MultiSubscriptionsReporter(requisitionAttributes.subscriptions);
        this.requisitionTimeout = requisitionAttributes.timeout;
        this.onFinishCallback = () => {
            //do nothing
        };
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        this.reportGenerator.start(this.requisitionTimeout);
        this.onFinishCallback = onFinishCallback;
        Logger.trace('Multisubscribing');
        this.multiSubscriptionsReporter.connect()
            .then(() => {
                Logger.trace('Multisubscriptions are ready');
                this.initializeTimeout();
                this.onSubscriptionsCompleted();
            })
            .catch(err => {
                Logger.error(`Error connecting multiSubscription: ${err}`);
                this.onFinish(err);
            });
    }

    public getReport(): output.RequisitionModel {
        return this.reportGenerator.getReport();
    }

    private onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => {
                Logger.error(`Error receiving message in multiSubscription: ${err}`);
                this.onFinish(err);
            });
        Logger.debug('Triggering start event');
        this.startEvent.start()
            .then(() => {
                this.startEventDoneItsJob = true;
                this.tryToFinishExecution();
            })
            .catch(err => {
                const message = `Error triggering startingEvent: ${err}`;
                Logger.error(message);
                this.onFinish(message);
            });

    }

    private initializeTimeout() {
        if (this.requisitionTimeout) {
            new Timeout(() => {
                this.onFinish('Requisition has timed out');
            }).start(this.requisitionTimeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info('All subscriptions stopped waiting');
        this.allSubscriptionsStoppedWaiting = true;
        this.tryToFinishExecution();
    }

    private tryToFinishExecution() {
        if (this.startEventDoneItsJob && this.allSubscriptionsStoppedWaiting) {
            this.onFinish();
        }
    }

    private onFinish(error?: string): void {
        this.onFinish = () => {
            //do nothing
        };
        Logger.info(`Start gathering reports`);

        if (error) {
            Logger.debug(`Error collected: ${error}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback();
    }
}
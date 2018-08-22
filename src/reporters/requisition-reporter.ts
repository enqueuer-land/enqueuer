import {ReportGenerator} from './report-generator';
import {Logger} from '../loggers/logger';
import {StartEventReporter} from './start-event/start-event-reporter';
import * as input from '../models/inputs/requisition-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {Timeout} from '../timers/timeout';
import {MultiSubscriptionsReporter} from './subscription/multi-subscriptions-reporter';
import {Container} from 'conditional-injector';
import {TestModel} from '../models/outputs/test-model';
import {EventTestExecutor} from '../testers/event-test-executor';

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
        this.executeOnInitFunction(requisitionAttributes);
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
        this.multiSubscriptionsReporter.subscribe()
            .then(() => {
                Logger.trace('Multisubscriptions are ready');
                this.initializeTimeout();
                this.onSubscriptionsCompleted();
            })
            .catch(err => {
                const message = `Error connecting multiSubscription: ${err}`;
                Logger.error(message);
                this.onFinish({valid: false, description: message, name: 'Subscriptions connection'});
            });
    }

    public getReport(): output.RequisitionModel {
        return this.reportGenerator.getReport();
    }

    private onSubscriptionsCompleted() {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(err => {
                const message = `Error receiving message in multiSubscription: ${err}`;
                Logger.error(message);
                this.onFinish({valid: false, description: err, name: 'Subscriptions message receiving'});
            });
        Logger.debug('Triggering start event');
        this.startEvent.start()
            .then(() => {
                Logger.debug('Start event triggered');
                this.startEventDoneItsJob = true;
                this.tryToFinishExecution();
            })
            .catch(err => {
                const message = `Error triggering startEvent: ${err}`;
                Logger.error(message);
                this.onFinish({valid: false, description: err, name: 'Start Event'});
            });

    }

    private initializeTimeout() {
        if (this.requisitionTimeout) {
            new Timeout(() => {
                this.onFinish();
            }).start(this.requisitionTimeout);
        }
    }

    private onAllSubscriptionsStopWaiting(): void {
        Logger.info('All subscriptions have done their job');
        this.allSubscriptionsStoppedWaiting = true;
        this.tryToFinishExecution();
    }

    private tryToFinishExecution() {
        if (this.startEventDoneItsJob && this.allSubscriptionsStoppedWaiting) {
            this.onFinish();
        }
    }

    private onFinish(error?: TestModel): void {
        this.onFinish = () => {
            //do nothing
        };
        Logger.info(`Start gathering reports`);

        if (error) {
            Logger.debug(`Requisition error collected: ${JSON.stringify(error)}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setStartEventReport(this.startEvent.getReport());
        this.reportGenerator.setSubscriptionReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();
        this.onFinishCallback();
    }

    private executeOnInitFunction(requisitionAttributes: RequisitionModel) {
        if (requisitionAttributes.onInit) {
            Logger.info(`Executing requisition::onInit hook function`);
            const eventTestExecutor = new EventTestExecutor(requisitionAttributes.onInit);
            eventTestExecutor.addArgument('requisition', requisitionAttributes);

            const tests = eventTestExecutor.execute();
            this.reportGenerator.addTests(tests.map(test => {
                return {name: test.label, valid: test.valid, description: test.errorDescription};
            }));
        }
    }
}
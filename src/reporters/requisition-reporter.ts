import {RequisitionReportGenerator} from './requisition-report-generator';
import {Logger} from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {Timeout} from '../timers/timeout';
import {MultiSubscriptionsReporter} from './subscription/multi-subscriptions-reporter';
import {TestModel} from '../models/outputs/test-model';
import {OnInitEventExecutor} from '../events/on-init-event-executor';
import {OnFinishEventExecutor} from '../events/on-finish-event-executor';
import {MultiPublishersReporter} from './publishers/multi-publishers-reporter';

export type RequisitionRunnerCallback = () => void;

export class RequisitionReporter {
    public static readonly DEFAULT_TIMEOUT = 5 * 1000;
    private readonly timeout?: number;
    private readonly requisitionAttributes: RequisitionModel;
    private reportGenerator: RequisitionReportGenerator;
    private multiSubscriptionsReporter: MultiSubscriptionsReporter;
    private multiPublishersReporter: MultiPublishersReporter;
    private onFinishCallback: RequisitionRunnerCallback;
    private publishersDoneTheirJob = false;
    private allSubscriptionsStoppedWaiting = false;
    private readonly startTime: Date;

    constructor(requisitionAttributes: input.RequisitionModel) {
        this.requisitionAttributes = requisitionAttributes;
        const onInitFunctionTests = this.executeOnInitFunction();
        if (this.requisitionAttributes.timeout === undefined) {
            this.requisitionAttributes.timeout = RequisitionReporter.DEFAULT_TIMEOUT;
        } else if (this.requisitionAttributes.timeout <= 0) {
            delete this.requisitionAttributes.timeout;
        }
        this.startTime = new Date();
        this.timeout = this.requisitionAttributes.timeout;
        this.reportGenerator = new RequisitionReportGenerator(this.requisitionAttributes, this.timeout);
        this.reportGenerator.addTests(onInitFunctionTests);
        this.multiSubscriptionsReporter = new MultiSubscriptionsReporter(this.requisitionAttributes.subscriptions, this.requisitionAttributes);
        this.multiPublishersReporter = new MultiPublishersReporter(this.requisitionAttributes.publishers, this.requisitionAttributes);
        this.onFinishCallback = () => {
            //do nothing
        };
    }

    public start(onFinishCallback: RequisitionRunnerCallback): void {
        this.onFinishCallback = onFinishCallback;
        this.initializeTimeout();
        Logger.debug('Preparing subscriptions');
        this.multiSubscriptionsReporter.start(() => this.onAllSubscriptionsStopWaiting());
        this.multiSubscriptionsReporter
            .subscribe()
            .then(() => {
                Logger.debug('Multisubscriptions are ready');
                return this.onSubscriptionsCompleted();
            })
            .catch(err => {
                const message = `Error connecting multiSubscription: ${err}`;
                Logger.error(message);
                return this.onRequisitionFinish({valid: false, description: message, name: 'Subscriptions subscription'});
            });
    }

    public getReport(): output.RequisitionModel {
        return this.reportGenerator.getReport();
    }

    private onSubscriptionsCompleted(): void {
        this.multiSubscriptionsReporter.receiveMessage()
            .then(() => this.onAllSubscriptionsStopWaiting())
            .catch(async err => {
                const message = `Error receiving message in multiSubscription: ${err}`;
                Logger.error(message);
                await this.onRequisitionFinish({valid: false, description: err, name: 'Subscriptions message receiving'});
            });
        this.multiPublishersReporter.publish()
            .then(async () => {
                Logger.info('All publishers have done their job');
                this.publishersDoneTheirJob = true;
                await this.tryToFinishExecution();
            })
            .catch(async err => {
                const message = `Error publishing publication: ${err}`;
                Logger.error(message);
                await this.onRequisitionFinish({valid: false, description: err, name: 'Publishers publication'});
            });
    }

    private initializeTimeout() {
        Logger.info('Starting requisition time out');
        if (this.timeout) {
            new Timeout(async () => {
                if (!this.publishersDoneTheirJob || !this.allSubscriptionsStoppedWaiting) {
                    Logger.info(`Requisition timed out`);
                    await this.onRequisitionFinish();
                }
            }).start(this.timeout);
        }
    }

    private async onAllSubscriptionsStopWaiting(): Promise<void> {
        Logger.info('All subscriptions have done their job');
        this.allSubscriptionsStoppedWaiting = true;
        await this.tryToFinishExecution();
    }

    private async tryToFinishExecution() {
        if (this.publishersDoneTheirJob && this.allSubscriptionsStoppedWaiting) {
            await this.onRequisitionFinish();
        }
    }

    private async onRequisitionFinish(error?: TestModel): Promise<void> {
        this.onRequisitionFinish = async (): Promise<void> => {
            //do nothing
        };
        await this.executeOnFinishFunction();
        Logger.info(`Start gathering reports`);

        if (error) {
            Logger.debug(`Requisition error collected: ${JSON.stringify(error)}`);
            this.reportGenerator.addError(error);
        }
        this.reportGenerator.setPublishersReport(this.multiPublishersReporter.getReport());
        this.reportGenerator.setSubscriptionsReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();

        await this.multiSubscriptionsReporter.unsubscribe();

        Logger.debug(`Subscriptions unsubscribed`);
        this.onFinishCallback();
    }

    private executeOnInitFunction() {
        Logger.debug(`Executing requisition::onInit hook function`);
        return new OnInitEventExecutor('requisition', this.requisitionAttributes).trigger();
    }

    private async executeOnFinishFunction(): Promise<void> {
        this.multiSubscriptionsReporter.onFinish();
        const onFinishEventExecutor = new OnFinishEventExecutor('requisition', this.requisitionAttributes);
        onFinishEventExecutor.addArgument('elapsedTime', new Date().getTime() - this.startTime.getTime());
        this.reportGenerator.addTests(onFinishEventExecutor.trigger());
        this.multiPublishersReporter.onFinish();
    }

}

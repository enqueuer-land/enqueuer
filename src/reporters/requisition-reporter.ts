import {RequisitionReportGenerator} from './requisition-report-generator';
import {Logger} from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {MultiSubscriptionsReporter} from './subscription/multi-subscriptions-reporter';
import {OnInitEventExecutor} from '../events/on-init-event-executor';
import {OnFinishEventExecutor} from '../events/on-finish-event-executor';
import {MultiPublishersReporter} from './publishers/multi-publishers-reporter';

export class RequisitionReporter {
    public static readonly DEFAULT_TIMEOUT = 5 * 1000;
    private readonly timeout?: number;
    private readonly requisitionAttributes: RequisitionModel;
    private readonly startTime: Date;
    private reportGenerator: RequisitionReportGenerator;
    private multiSubscriptionsReporter: MultiSubscriptionsReporter;
    private multiPublishersReporter: MultiPublishersReporter;
    private hasFinished: boolean = false;

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
        this.multiSubscriptionsReporter = new MultiSubscriptionsReporter(this.requisitionAttributes.subscriptions);
        this.multiPublishersReporter = new MultiPublishersReporter(this.requisitionAttributes.publishers);
    }

    public async delay(): Promise<void> {
        const delay = this.requisitionAttributes.delay || 0;
        if (delay > 0) {
            Logger.info(`Delaying requisition '${this.requisitionAttributes.name}' for ${delay}ms`);
            return await new Promise((resolve) => setTimeout(() => resolve(), delay));
        }
    }

    public async startTimeout(): Promise<output.RequisitionModel> {
        return new Promise(async (resolve) => {
            if (this.timeout) {
                Logger.info('Starting requisition time out');
                await new Promise((resolve) => setTimeout(() => resolve(), this.timeout));
                if (!this.hasFinished) {
                    Logger.info(`Requisition timed out`);
                    await this.onRequisitionFinish();
                    resolve(this.reportGenerator.getReport());
                }
            }
        });
    }

    public async execute(): Promise<output.RequisitionModel> {
        try {
            this.multiSubscriptionsReporter.start();
            await this.multiSubscriptionsReporter.subscribe();
            await Promise.all([this.multiSubscriptionsReporter.receiveMessage(), this.multiPublishersReporter.publish()]);
        } catch (err) {
            Logger.error(`Requisition error: ${err}`);
            this.reportGenerator.addTests([{name: 'Requisition error', valid: false, description: err}]);
        }
        if (!this.hasFinished) {
            await this.onRequisitionFinish();
        }
        return this.reportGenerator.getReport();
    }

    private async onRequisitionFinish(): Promise<void> {
        this.hasFinished = true;
        await this.executeOnFinishFunction();
        Logger.info(`Start gathering reports`);

        this.reportGenerator.setPublishersReport(this.multiPublishersReporter.getReport());
        this.reportGenerator.setSubscriptionsReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();

        await this.multiSubscriptionsReporter.unsubscribe();
    }

    private executeOnInitFunction() {
        Logger.debug(`Executing requisition onInit hook function`);
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

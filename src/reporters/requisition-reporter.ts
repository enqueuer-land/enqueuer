import {RequisitionReportGenerator} from './requisition-report-generator';
import {Logger} from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import {MultiSubscriptionsReporter} from './subscription/multi-subscriptions-reporter';
import {MultiPublishersReporter} from './publishers/multi-publishers-reporter';
import {EventExecutor} from '../events/event-executor';
import {DefaultHookEvents} from '../models/events/event';
import {TestModel} from '../models/outputs/test-model';

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
        this.reportGenerator = new RequisitionReportGenerator(this.requisitionAttributes, this.timeout);
        this.startTime = new Date();
        this.executeOnInitFunction();
        if (this.requisitionAttributes.timeout === undefined) {
            this.timeout = RequisitionReporter.DEFAULT_TIMEOUT;
        } else if (this.requisitionAttributes.timeout > 0) {
            this.timeout = this.requisitionAttributes.timeout;
        }
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
                    Logger.info(`Requisition '${this.requisitionAttributes.name}' timed out`);
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
            this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH,
                {valid: false, tests: [{name: 'Requisition error', description: err, valid: false}]});
        }
        if (!this.hasFinished) {
            await this.onRequisitionFinish();
        }
        return this.reportGenerator.getReport();
    }

    private async onRequisitionFinish(): Promise<void> {
        this.hasFinished = true;
        await this.multiSubscriptionsReporter.unsubscribe();
        await this.executeOnFinishFunction();
        Logger.info(`Start gathering reports`);

        this.reportGenerator.setPublishersReport(this.multiPublishersReporter.getReport());
        this.reportGenerator.setSubscriptionsReport(this.multiSubscriptionsReporter.getReport());
        this.reportGenerator.finish();

    }

    private executeOnInitFunction(): TestModel[] {
        Logger.debug(`Executing requisition onInit hook function`);
        const eventExecutor = new EventExecutor(this.requisitionAttributes, DefaultHookEvents.ON_INIT, 'requisition');
        const elapsedTime = new Date().getTime() - this.startTime.getTime();
        eventExecutor.addArgument('elapsedTime', elapsedTime);
        const testModels = eventExecutor.execute();
        this.reportGenerator.addTest(DefaultHookEvents.ON_INIT,
            {valid: testModels.every(test => test.valid), tests: testModels, arguments: {elapsedTime: elapsedTime}});
        return testModels;
    }

    private async executeOnFinishFunction(): Promise<void> {
        this.multiSubscriptionsReporter.onFinish();
        const onFinishEventExecutor = new EventExecutor(this.requisitionAttributes, DefaultHookEvents.ON_FINISH, 'requisition');
        const elapsedTime = new Date().getTime() - this.startTime.getTime();
        onFinishEventExecutor.addArgument('elapsedTime', elapsedTime);
        const testModels = onFinishEventExecutor.execute();
        this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH,
            {valid: testModels.every(test => test.valid), tests: testModels, arguments: {elapsedTime: elapsedTime}});
        this.multiPublishersReporter.onFinish();
    }

}

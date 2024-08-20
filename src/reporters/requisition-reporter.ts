import { RequisitionReportGenerator } from './requisition-report-generator';
import { Logger } from '../loggers/logger';
import * as input from '../models/inputs/requisition-model';
import { RequisitionModel } from '../models/inputs/requisition-model';
import * as output from '../models/outputs/requisition-model';
import { MultiSubscriptionsReporter } from './subscription/multi-subscriptions-reporter';
import { MultiPublishersReporter } from './publishers/multi-publishers-reporter';
import { EventExecutor } from '../events/event-executor';
import { DefaultHookEvents } from '../models/events/event';
import { TestModel } from '../models/outputs/test-model';
import { NotificationEmitter } from '../notifications/notification-emitter';
import { Notifications } from '../notifications/notifications';
import { HookReporter } from './hook-reporter';

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
    if (this.requisitionAttributes.timeout === undefined) {
      this.timeout = RequisitionReporter.DEFAULT_TIMEOUT;
    } else if (this.requisitionAttributes.timeout > 0) {
      this.timeout = this.requisitionAttributes.timeout;
    }
    this.reportGenerator = new RequisitionReportGenerator(this.requisitionAttributes, this.timeout);
    this.startTime = new Date();
    this.executeOnInitFunction();
    this.multiSubscriptionsReporter = new MultiSubscriptionsReporter(this.requisitionAttributes.subscriptions);
    this.multiPublishersReporter = new MultiPublishersReporter(this.requisitionAttributes.publishers);
  }

  public async delay(): Promise<void> {
    const delay = this.requisitionAttributes.delay || 0;
    if (delay > 0) {
      Logger.info(`Delaying requisition '${this.requisitionAttributes.name}' for ${delay}ms`);
      return await this.sleep(delay);
    }
  }

  public async startTimeout(): Promise<output.RequisitionModel> {
    return new Promise(async resolve => {
      const timeout = this.timeout;
      if (timeout) {
        Logger.debug('Starting requisition time out');
        await this.sleep(timeout);
        if (!this.hasFinished) {
          Logger.info(`Requisition '${this.requisitionAttributes.name}' has timed out (${timeout}ms)`);
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
      this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH, {
        valid: false,
        tests: [{ name: 'Requisition error', description: '' + err, valid: false }]
      });
    }
    if (!this.hasFinished) {
      await this.onRequisitionFinish();
    }
    return this.reportGenerator.getReport();
  }

  public async interrupt(): Promise<output.RequisitionModel> {
    if (!this.hasFinished) {
      await this.onRequisitionFinish();
      this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH, {
        valid: false,
        tests: [
          {
            valid: false,
            name: 'Requisition interrupted',
            description: `Requisition interrupted`
          }
        ]
      });
    }
    return this.reportGenerator.getReport();
  }

  private async sleep(delay: number): Promise<void> {
    return await new Promise(timeoutResolve => setTimeout(() => timeoutResolve(), delay));
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
    Logger.debug(`Executing requisition's 'onInit' hook function`);
    const eventExecutor = new EventExecutor(this.requisitionAttributes, DefaultHookEvents.ON_INIT, 'requisition');
    const elapsedTime = new Date().getTime() - this.startTime.getTime();
    eventExecutor.addArgument('elapsedTime', elapsedTime);
    const testModels = eventExecutor.execute();
    const hookResult = {
      valid: testModels.every(test => test.valid),
      tests: testModels,
      arguments: { elapsedTime: elapsedTime }
    };
    this.reportGenerator.addTest(DefaultHookEvents.ON_INIT, hookResult);
    NotificationEmitter.emit(Notifications.HOOK_FINISHED, {
      hookName: DefaultHookEvents.ON_INIT,
      hook: hookResult,
      requisition: this.requisitionAttributes
    });
    return testModels;
  }

  private async executeOnFinishFunction(): Promise<void> {
    this.multiSubscriptionsReporter.onFinish();
    const onFinishEventExecutor = new EventExecutor(
      this.requisitionAttributes,
      DefaultHookEvents.ON_FINISH,
      'requisition'
    );
    const elapsedTime = new Date().getTime() - this.startTime.getTime();
    onFinishEventExecutor.addArgument('elapsedTime', elapsedTime);
    const testModels = onFinishEventExecutor.execute();
    const hookModel = {
      valid: testModels.every(test => test.valid),
      tests: testModels,
      arguments: { elapsedTime: elapsedTime }
    };
    this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH, hookModel);
    NotificationEmitter.emit(Notifications.HOOK_FINISHED, {
      hookName: DefaultHookEvents.ON_FINISH,
      hook: hookModel,
      requisition: this.requisitionAttributes
    });
    this.multiPublishersReporter.onFinish();
  }
}

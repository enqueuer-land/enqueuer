import { TaskReportGenerator } from './task-report-generator';
import { Logger } from '../loggers/logger';
import * as input from '../models/inputs/task-model';
import { TaskModel } from '../models/inputs/task-model';
import * as output from '../models/outputs/task-model';
import { MultiSensorsReporter } from './sensor/multi-sensors-reporter';
import { MultiActuatorsReporter } from './actuator/multi-actuators-reporter';
import { EventExecutor } from '../events/event-executor';
import { DefaultHookEvents } from '../models/events/event';
import { TestModel } from '../models/outputs/test-model';
import { NotificationEmitter } from '../notifications/notification-emitter';
import { Notifications } from '../notifications/notifications';

export class TaskReporter {
  public static readonly DEFAULT_TIMEOUT = 5 * 1000;
  private readonly timeout?: number;
  private readonly taskAttributes: TaskModel;
  private readonly startTime: Date;
  private reportGenerator: TaskReportGenerator;
  private multiSensorsReporter: MultiSensorsReporter;
  private multiActuatorsReporter: MultiActuatorsReporter;
  private hasFinished: boolean = false;

  constructor(taskAttributes: input.TaskModel) {
    this.taskAttributes = taskAttributes;
    if (this.taskAttributes.timeout === undefined) {
      this.timeout = TaskReporter.DEFAULT_TIMEOUT;
    } else if (this.taskAttributes.timeout > 0) {
      this.timeout = this.taskAttributes.timeout;
    }
    this.reportGenerator = new TaskReportGenerator(this.taskAttributes, this.timeout);
    this.startTime = new Date();
    this.executeOnInitFunction();
    this.multiSensorsReporter = new MultiSensorsReporter(this.taskAttributes.sensors);
    this.multiActuatorsReporter = new MultiActuatorsReporter(this.taskAttributes.actuators);
  }

  public async delay(): Promise<void> {
    const delay = this.taskAttributes.delay || 0;
    if (delay > 0) {
      Logger.info(`Delaying task '${this.taskAttributes.name}' for ${delay}ms`);
      return await this.sleep(delay);
    }
  }

  public async startTimeout(): Promise<output.TaskModel> {
    return new Promise(async resolve => {
      const timeout = this.timeout;
      if (timeout) {
        Logger.debug('Starting task time out');
        await this.sleep(timeout);
        if (!this.hasFinished) {
          Logger.info(`Task '${this.taskAttributes.name}' has timed out (${timeout}ms)`);
          await this.onTaskFinish();
          resolve(this.reportGenerator.getReport());
        }
      }
    });
  }

  public async execute(): Promise<output.TaskModel> {
    try {
      this.multiSensorsReporter.start();
      await this.multiSensorsReporter.prepare();
      await Promise.all([this.multiSensorsReporter.receiveMessage(), this.multiActuatorsReporter.act()]);
    } catch (err) {
      Logger.error(`Task error: ${err}`);
      this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH, {
        valid: false,
        tests: [{ name: 'Task error', description: '' + err, valid: false }]
      });
    }
    if (!this.hasFinished) {
      await this.onTaskFinish();
    }
    return this.reportGenerator.getReport();
  }

  public async interrupt(): Promise<output.TaskModel> {
    if (!this.hasFinished) {
      await this.onTaskFinish();
      this.reportGenerator.addTest(DefaultHookEvents.ON_FINISH, {
        valid: false,
        tests: [
          {
            valid: false,
            name: 'Task interrupted',
            description: `Task interrupted`
          }
        ]
      });
    }
    return this.reportGenerator.getReport();
  }

  private async sleep(delay: number): Promise<void> {
    return await new Promise(timeoutResolve => setTimeout(() => timeoutResolve(), delay));
  }

  private async onTaskFinish(): Promise<void> {
    this.hasFinished = true;
    await this.multiSensorsReporter.unprepare();
    await this.executeOnFinishFunction();
    Logger.info(`Start gathering reports`);

    this.reportGenerator.setActuatorsReport(this.multiActuatorsReporter.getReport());
    this.reportGenerator.setSensorsReport(this.multiSensorsReporter.getReport());
    this.reportGenerator.finish();
  }

  private executeOnInitFunction(): TestModel[] {
    Logger.debug(`Executing task's 'onInit' hook function`);
    const eventExecutor = new EventExecutor(this.taskAttributes, DefaultHookEvents.ON_INIT, 'task');
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
      task: this.taskAttributes
    });
    return testModels;
  }

  private async executeOnFinishFunction(): Promise<void> {
    this.multiSensorsReporter.onFinish();
    const onFinishEventExecutor = new EventExecutor(this.taskAttributes, DefaultHookEvents.ON_FINISH, 'task');
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
      task: this.taskAttributes
    });
    this.multiActuatorsReporter.onFinish();
  }
}

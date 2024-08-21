import { Actuator } from '../../actuators/actuator';
import { DateController } from '../../timers/date-controller';
import * as output from '../../models/outputs/actuator-model';
import { ActuatorModel } from '../../models/outputs/actuator-model';
import * as input from '../../models/inputs/actuator-model';
import { Logger } from '../../loggers/logger';
import { DynamicModulesManager } from '../../plugins/dynamic-modules-manager';
import { EventExecutor } from '../../events/event-executor';
import { DefaultHookEvents } from '../../models/events/event';
import { ObjectDecycler } from '../../object-parser/object-decycler';
import { TestModel, testModelIsPassing } from '../../models/outputs/test-model';
import { NotificationEmitter } from '../../notifications/notification-emitter';
import { HookModel } from '../../models/outputs/hook-model';
import { Notifications } from '../../notifications/notifications';
import { HookReporter } from '../hook-reporter';

export class ActuatorReporter {
  private readonly report: output.ActuatorModel;
  private readonly actuator: Actuator;
  private readonly startTime: Date;
  private readonly executedHooks: { [propName: string]: string[] };
  private acted: boolean = false;

  constructor(actuator: input.ActuatorModel) {
    this.report = {
      id: actuator.id,
      name: actuator.name,
      ignored: actuator.ignore,
      valid: true,
      hooks: {
        [DefaultHookEvents.ON_INIT]: { valid: true, tests: [] },
        [DefaultHookEvents.ON_FINISH]: { valid: true, tests: [] }
      },
      type: actuator.type
    };
    this.executedHooks = {};
    this.startTime = new Date();
    this.executeOnInitFunction(actuator);
    Logger.debug(`Trying to instantiate actuator from '${actuator.type}'`);
    this.actuator = DynamicModulesManager.getInstance().getProtocolManager().createActuator(actuator);
    this.actuator.registerHookEventExecutor((eventName: string, args: any) =>
      this.executeHookEvent(eventName, { ...args, elapsedTime: new Date().getTime() - this.startTime.getTime() })
    );
  }

  public async act(): Promise<void> {
    try {
      if (this.actuator.ignore) {
        Logger.trace(`Ignoring actuator ${this.report.name}`);
      } else {
        Logger.trace(`Publishing ${this.report.name}`);
        const response = await this.actuator.act();
        Logger.debug(`${this.report.name} acted`);
        this.report.messageSentInstant = new DateController().toString();
        this.acted = true;
        this.report.hooks![DefaultHookEvents.ON_FINISH].tests.push({
          name: 'Published',
          valid: this.acted,
          description: this.processMessage(response),
          implicit: true
        });
      }
    } catch (err) {
      Logger.error(`'${this.report.name}' fail publishing: ${err}`);
      this.report.hooks![DefaultHookEvents.ON_FINISH].tests.push({
        name: 'Published',
        valid: false,
        description: '' + err,
        implicit: true
      });
      this.report.valid = false;
      throw err;
    }
  }

  private processMessage(messageReceived: any): string {
    if (messageReceived) {
      if (typeof messageReceived === 'object') {
        return JSON.stringify(new ObjectDecycler().decycle(messageReceived), null, 2);
      }
      return messageReceived;
    }
    return 'Published successfully';
  }

  public getReport(): ActuatorModel {
    return this.report;
  }

  public onFinish(): void {
    if (!this.actuator.ignore) {
      this.executeHookEvent(DefaultHookEvents.ON_FINISH, {
        executedHooks: this.executedHooks,
        elapsedTime: new Date().getTime() - this.startTime.getTime()
      });
      this.report.valid = this.report.valid && this.acted;
      NotificationEmitter.emit(Notifications.PUBLISHER_FINISHED, {
        actuator: this.report
      });
    }
  }

  private executeHookEvent(eventName: string, args: any = {}, actuator: any = this.actuator): void {
    if (!actuator.ignore) {
      this.executedHooks[eventName] = Object.keys(args);
      args.elapsedTime = new Date().getTime() - this.startTime.getTime();
      const eventExecutor = new EventExecutor(actuator, eventName, 'actuator');
      Object.keys(args).forEach((key: string) => {
        eventExecutor.addArgument(key, args[key]);
      });
      const previousHook = this.report.hooks![eventName];
      let previousTests: TestModel[] = previousHook?.tests ?? [];
      const tests = previousTests.concat(eventExecutor.execute());
      const valid = tests.every((test: TestModel) => testModelIsPassing(test));
      const decycledArgs = new ObjectDecycler().decycle(args);
      const hookModel: HookModel = {
        arguments: decycledArgs,
        tests: tests,
        valid: valid
      };
      if (eventExecutor.isDebugMode()) {
        console.table(Object.keys(decycledArgs).join('; '));
        // console.table(decycledArgs);
      }
      //TODO investigate why this line wasn't added this file originally
      const hookResult = new HookReporter(this.report.hooks![eventName]).addValues(hookModel);
      this.report.hooks![eventName] = hookModel;
      NotificationEmitter.emit(Notifications.HOOK_FINISHED, {
        hookName: eventName,
        hook: hookResult,
        actuator: this.actuator
      });

      this.report.valid = this.report.valid && valid;
    }
  }

  private executeOnInitFunction(actuator: input.ActuatorModel) {
    if (!actuator.ignore) {
      NotificationEmitter.emit(Notifications.PUBLISHER_STARTED, {
        actuator: actuator
      });
      this.executeHookEvent(DefaultHookEvents.ON_INIT, {}, actuator);
    }
  }
}

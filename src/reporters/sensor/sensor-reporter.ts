import { Logger } from '../../loggers/logger';
import { DateController } from '../../timers/date-controller';
import { Sensor } from '../../sensors/sensor';
import { Timeout } from '../../timers/timeout';
import * as input from '../../models/inputs/sensor-model';
import { SensorModel } from '../../models/inputs/sensor-model';
import * as output from '../../models/outputs/sensor-model';
import { SensorFinalReporter } from './sensor-final-reporter';
import { DynamicModulesManager } from '../../plugins/dynamic-modules-manager';
import { EventExecutor } from '../../events/event-executor';
import { DefaultHookEvents } from '../../models/events/event';
import { ObjectDecycler } from '../../object-parser/object-decycler';
import { TestModel, testModelIsPassing } from '../../models/outputs/test-model';
import Signals = NodeJS.Signals;
import SignalsListener = NodeJS.SignalsListener;
import { HookReporter } from '../hook-reporter';
import { NotificationEmitter } from '../../notifications/notification-emitter';
import { Notifications } from '../../notifications/notifications';

export class SensorReporter {
  public static readonly DEFAULT_TIMEOUT: number = 3 * 1000;
  private readonly killListener: SignalsListener;
  private readonly report: output.SensorModel;
  private readonly startTime: DateController;
  private readonly sensor: Sensor;
  private readonly executedHooks: { [propName: string]: string[] };
  private getReadyError?: string;
  private hasTimedOut: boolean = false;
  private getReadyd: boolean = false;
  private totalTime?: DateController;

  constructor(sensorAttributes: input.SensorModel) {
    this.startTime = new DateController();
    this.report = {
      id: sensorAttributes.id,
      name: sensorAttributes.name,
      ignored: sensorAttributes.ignore,
      type: sensorAttributes.type,
      hooks: {
        [DefaultHookEvents.ON_INIT]: { valid: true, tests: [] },
        [DefaultHookEvents.ON_FINISH]: { valid: true, tests: [] }
      },
      valid: true
    };
    this.executedHooks = {};
    this.executeOnInitFunction(sensorAttributes);

    Logger.debug(`Instantiating sensor ${sensorAttributes.type}`);
    this.sensor = DynamicModulesManager.getInstance().getProtocolManager().createSensor(sensorAttributes);
    this.sensor.registerHookEventExecutor((eventName: string, args: any) =>
      this.executeHookEvent(eventName, { ...args, elapsedTime: new Date().getTime() - this.startTime.getTime() })
    );
    if (sensorAttributes.timeout === undefined) {
      this.sensor.timeout = SensorReporter.DEFAULT_TIMEOUT;
    } else if (sensorAttributes.timeout <= 0) {
      delete this.sensor.timeout;
    }
    this.killListener = (signal: Signals) => this.handleKillSignal(signal, this.sensor.type || 'undefined');
  }

  public hasFinished(): boolean {
    return this.sensor.ignore || this.sensor.messageReceived || this.hasTimedOut;
  }

  public startTimeout(onTimeOutCallback: Function) {
    if (this.sensor.timeout) {
      Logger.debug(`Starting sensor '${this.sensor.name}' timeout`);
      new Timeout(() => {
        if (!this.sensor.messageReceived) {
          this.totalTime = new DateController();
          const message = `Sensor '${this.sensor.name}' stopped waiting because it has timed out (${this.sensor.timeout}ms)`;
          Logger.info(message);
          this.hasTimedOut = true;
          onTimeOutCallback();
        }
      }).start(this.sensor.timeout);
    }
  }

  public async getReady(): Promise<void> {
    if (this.sensor.ignore) {
      Logger.trace(`Sensor '${this.sensor.name}' is ignored`);
    } else {
      try {
        Logger.trace(`Starting '${this.sensor.name}' time out`);
        Logger.trace(`Sensor '${this.sensor.name}' is getting ready`);
        await this.sensor.getReady();
        await this.handleSensor();
      } catch (err) {
        const message = `Sensor '${this.sensor.name}' is unable to getReady: ${err}`;
        Logger.error(message);
        this.getReadyError = `${err}`;
        throw err;
      }
    }
  }

  public async receiveMessage(): Promise<any> {
    if (!this.sensor.ignore) {
      try {
        const messageReceived = this.processMessage(await this.sensor.receiveMessage());
        this.sensor.messageReceived = messageReceived;
        Logger.debug(`${this.sensor.name} received its message`);
        this.handleMessageArrival();
        await this.sendSyncResponse();
        Logger.trace(`Sensor '${this.sensor.name}' has finished its job`);
      } catch (err) {
        this.sensor.close().catch(console.log.bind(console));
        Logger.error(`Sensor '${this.sensor.name}' is unable to receive message: ${err}`);
        throw err;
      }
    }
  }

  private processMessage(messageReceived: any): string {
    if (messageReceived) {
      if (typeof messageReceived === 'object') {
        return JSON.stringify(new ObjectDecycler().decycle(messageReceived), null, 2);
      }
      return messageReceived;
    }
    return `Sensor has received its message`;
  }

  private async handleSensor(): Promise<boolean> {
    process.once('SIGINT', this.killListener).once('SIGTERM', this.killListener);
    if (this.hasTimedOut) {
      const message = `Sensor '${this.sensor.name}' sensor because it has timed out`;
      Logger.error(message);
      return false;
    } else {
      this.report.sensorTime = new DateController().toString();
      this.getReadyd = true;
      return true;
    }
  }

  private async sendSyncResponse(): Promise<void> {
    try {
      Logger.debug(`Sensor ${this.sensor.type} sending synchronous response`);
      await this.sensor.respond();
    } catch (err) {
      Logger.warning(`Error ${this.sensor.type} synchronous response sending: ${err}`);
      this.report.hooks![DefaultHookEvents.ON_FINISH].tests = this.report.hooks![
        DefaultHookEvents.ON_FINISH
      ].tests.concat({
        valid: false,
        name: 'Response sent',
        description: `${err}`
      });
    }
  }

  public getReport(): output.SensorModel {
    const time: any = {
      timeout: this.sensor.timeout
    };
    if (!this.totalTime) {
      this.totalTime = new DateController();
    }
    time.totalTime = this.totalTime.getTime() - this.startTime.getTime();
    const finalReporter = new SensorFinalReporter({
      getReadyd: this.getReadyd,
      avoidable: this.sensor.avoid,
      messageReceived: this.sensor.messageReceived,
      time: time,
      getReadyError: this.getReadyError,
      ignore: this.sensor.ignore
    });

    const finalReport = finalReporter.getReport();
    this.report.hooks![DefaultHookEvents.ON_FINISH].tests =
      this.report.hooks![DefaultHookEvents.ON_FINISH].tests.concat(finalReport);
    this.report.hooks![DefaultHookEvents.ON_FINISH].valid =
      this.report.hooks![DefaultHookEvents.ON_FINISH].valid &&
      finalReport.every((report: TestModel) => testModelIsPassing(report));

    this.report.valid =
      this.report.valid &&
      Object.keys(this.report.hooks || {}).every((key: string) =>
        this.report.hooks ? this.report.hooks[key].valid : true
      );
    return this.report;
  }

  public async close(): Promise<void> {
    process.removeListener('SIGINT', this.killListener).removeListener('SIGTERM', this.killListener);

    Logger.debug(`Closing sensor ${this.sensor.type}`);
    if (this.getReadyd) {
      return this.sensor.close();
    }
  }

  public onFinish() {
    if (!this.sensor.ignore) {
      this.executeHookEvent(DefaultHookEvents.ON_FINISH, {
        executedHooks: this.executedHooks,
        elapsedTime: new Date().getTime() - this.startTime.getTime()
      });
      NotificationEmitter.emit(Notifications.SUBSCRIPTION_FINISHED, {
        sensor: this.report
      });
    }
  }

  private executeHookEvent(eventName: string, additionalArgs: any = {}, sensor: any = this.sensor): void {
    if (!sensor.ignore) {
      this.executedHooks[eventName] = Object.keys(additionalArgs);
      const eventExecutor = new EventExecutor(sensor, eventName, 'sensor');
      if (typeof additionalArgs === 'object') {
        Object.keys(additionalArgs).forEach((key: string) => {
          eventExecutor.addArgument(key, additionalArgs[key]);
        });
      }
      const tests = eventExecutor.execute();
      const valid = tests.every((test: TestModel) => testModelIsPassing(test));
      const decycledArgs = new ObjectDecycler().decycle(additionalArgs);
      const hookModel = {
        arguments: decycledArgs,
        tests: tests,
        valid: valid
      };
      if (eventExecutor.isDebugMode()) {
        // console.table(decycledArgs);
        console.table(Object.keys(decycledArgs).join('; '));
      }
      const hookResult = new HookReporter(this.report.hooks![eventName]).addValues(hookModel);
      this.report.hooks![eventName] = hookResult;
      NotificationEmitter.emit(Notifications.HOOK_FINISHED, {
        hookName: eventName,
        hook: hookResult,
        sensor: this.sensor
      });
    }
  }

  private handleMessageArrival() {
    if (!this.hasTimedOut) {
      Logger.debug(`${this.sensor.name} stop waiting because it has received its message`);
      this.totalTime = new DateController();
    } else {
      Logger.info(`${this.sensor.name} has received message in a unable time`);
    }
    Logger.debug(`${this.sensor.name} handled message arrival`);
  }

  private executeOnInitFunction(sensorAttributes: SensorModel) {
    if (!sensorAttributes.ignore) {
      NotificationEmitter.emit(Notifications.SUBSCRIPTION_STARTED, {
        sensor: sensorAttributes
      });
      this.executeHookEvent(DefaultHookEvents.ON_INIT, {}, sensorAttributes);
    }
  }

  private async handleKillSignal(signal: Signals, type: string): Promise<void> {
    Logger.debug(`Sensor reporter '${type}' handling kill signal ${signal}`);
    await this.close();
    Logger.debug(`Sensor reporter '${type}' closed`);
  }
}

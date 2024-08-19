import { Logger } from '../../loggers/logger';
import { DateController } from '../../timers/date-controller';
import { Subscription } from '../../subscriptions/subscription';
import { Timeout } from '../../timers/timeout';
import * as input from '../../models/inputs/subscription-model';
import { SubscriptionModel } from '../../models/inputs/subscription-model';
import * as output from '../../models/outputs/subscription-model';
import { SubscriptionFinalReporter } from './subscription-final-reporter';
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

export class SubscriptionReporter {
  public static readonly DEFAULT_TIMEOUT: number = 3 * 1000;
  private readonly killListener: SignalsListener;
  private readonly report: output.SubscriptionModel;
  private readonly startTime: DateController;
  private readonly subscription: Subscription;
  private readonly executedHooks: { [propName: string]: string[] };
  private subscribeError?: string;
  private hasTimedOut: boolean = false;
  private subscribed: boolean = false;
  private totalTime?: DateController;

  constructor(subscriptionAttributes: input.SubscriptionModel) {
    this.startTime = new DateController();
    this.report = {
      id: subscriptionAttributes.id,
      name: subscriptionAttributes.name,
      ignored: subscriptionAttributes.ignore,
      type: subscriptionAttributes.type,
      hooks: {
        [DefaultHookEvents.ON_INIT]: { valid: true, tests: [] },
        [DefaultHookEvents.ON_FINISH]: { valid: true, tests: [] }
      },
      valid: true
    };
    this.executedHooks = {};
    this.executeOnInitFunction(subscriptionAttributes);

    Logger.debug(`Instantiating subscription ${subscriptionAttributes.type}`);
    this.subscription = DynamicModulesManager.getInstance()
      .getProtocolManager()
      .createSubscription(subscriptionAttributes);
    this.subscription.registerHookEventExecutor((eventName: string, args: any) =>
      this.executeHookEvent(eventName, args)
    );
    if (subscriptionAttributes.timeout === undefined) {
      this.subscription.timeout = SubscriptionReporter.DEFAULT_TIMEOUT;
    } else if (subscriptionAttributes.timeout <= 0) {
      delete this.subscription.timeout;
    }
    this.killListener = (signal: Signals) => this.handleKillSignal(signal, this.subscription.type || 'undefined');
  }

  public hasFinished(): boolean {
    return this.subscription.ignore || this.subscription.messageReceived || this.hasTimedOut;
  }

  public startTimeout(onTimeOutCallback: Function) {
    if (this.subscription.timeout) {
      Logger.debug(`Starting subscription '${this.subscription.name}' timeout`);
      new Timeout(() => {
        if (!this.subscription.messageReceived) {
          this.totalTime = new DateController();
          const message = `Subscription '${this.subscription.name}' stopped waiting because it has timed out`;
          Logger.info(message);
          this.hasTimedOut = true;
          onTimeOutCallback();
        }
      }).start(this.subscription.timeout);
    }
  }

  public async subscribe(): Promise<void> {
    if (this.subscription.ignore) {
      Logger.trace(`Subscription '${this.subscription.name}' is ignored`);
    } else {
      try {
        Logger.trace(`Starting '${this.subscription.name}' time out`);
        Logger.trace(`Subscription '${this.subscription.name}' is subscribing`);
        await this.subscription.subscribe();
        await this.handleSubscription();
      } catch (err) {
        const message = `Subscription '${this.subscription.name}' is unable to subscribe: ${err}`;
        Logger.error(message);
        this.subscribeError = `${err}`;
        throw err;
      }
    }
  }

  public async receiveMessage(): Promise<any> {
    if (!this.subscription.ignore) {
      try {
        const messageReceived = this.processMessage(await this.subscription.receiveMessage());
        this.subscription.messageReceived = messageReceived;
        Logger.debug(`${this.subscription.name} received its message`);
        this.handleMessageArrival();
        await this.sendSyncResponse();
        Logger.trace(`Subscription '${this.subscription.name}' has finished its job`);
      } catch (err) {
        this.subscription.unsubscribe().catch(console.log.bind(console));
        Logger.error(`Subscription '${this.subscription.name}' is unable to receive message: ${err}`);
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
    return `Subscription has received its message`;
  }

  private async handleSubscription(): Promise<boolean> {
    process.once('SIGINT', this.killListener).once('SIGTERM', this.killListener);
    if (this.hasTimedOut) {
      const message = `Subscription '${this.subscription.name}' subscription because it has timed out`;
      Logger.error(message);
      return false;
    } else {
      this.report.subscriptionTime = new DateController().toString();
      this.subscribed = true;
      return true;
    }
  }

  private async sendSyncResponse(): Promise<void> {
    try {
      Logger.debug(`Subscription ${this.subscription.type} sending synchronous response`);
      await this.subscription.sendResponse();
    } catch (err) {
      Logger.warning(`Error ${this.subscription.type} synchronous response sending: ${err}`);
      this.report.hooks![DefaultHookEvents.ON_FINISH].tests = this.report.hooks![
        DefaultHookEvents.ON_FINISH
      ].tests.concat({
        valid: false,
        name: 'Response sent',
        description: `${err}`
      });
    }
  }

  public getReport(): output.SubscriptionModel {
    const time: any = {
      timeout: this.subscription.timeout
    };
    if (!this.totalTime) {
      this.totalTime = new DateController();
    }
    time.totalTime = this.totalTime.getTime() - this.startTime.getTime();
    const finalReporter = new SubscriptionFinalReporter({
      subscribed: this.subscribed,
      avoidable: this.subscription.avoid,
      messageReceived: this.subscription.messageReceived,
      time: time,
      subscribeError: this.subscribeError,
      ignore: this.subscription.ignore
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

  public async unsubscribe(): Promise<void> {
    process.removeListener('SIGINT', this.killListener).removeListener('SIGTERM', this.killListener);

    Logger.debug(`Unsubscribing subscription ${this.subscription.type}`);
    if (this.subscribed) {
      return this.subscription.unsubscribe();
    }
  }

  public onFinish() {
    Logger.trace(`Executing subscription onFinish`);
    if (!this.subscription.ignore) {
      this.executeHookEvent(DefaultHookEvents.ON_FINISH, {
        executedHooks: this.executedHooks
      });
      NotificationEmitter.emit(Notifications.SUBSCRIPTION_FINISHED, {
        subscription: this.report
      });
    }
  }

  private executeHookEvent(eventName: string, args: any = {}, subscription: any = this.subscription): void {
    if (!subscription.ignore) {
      this.executedHooks[eventName] = Object.keys(args);
      args.elapsedTime = new Date().getTime() - this.startTime.getTime();
      const eventExecutor = new EventExecutor(subscription, eventName, 'subscription');
      if (typeof args === 'object') {
        Object.keys(args).forEach((key: string) => {
          eventExecutor.addArgument(key, args[key]);
        });
      }
      const tests = eventExecutor.execute();
      const valid = tests.every((test: TestModel) => testModelIsPassing(test));
      const decycledArgs = new ObjectDecycler().decycle(args);
      const hookModel = {
        arguments: decycledArgs,
        tests: tests,
        valid: valid
      };
      console.log('subs: ' + eventName + JSON.stringify(decycledArgs));
      const hookResult = new HookReporter(this.report.hooks![eventName]).addValues(hookModel);
      this.report.hooks![eventName] = hookResult;
      NotificationEmitter.emit(Notifications.HOOK_FINISHED, {
        hookName: eventName,
        hook: hookResult,
        subscription: this.subscription
      });
    }
  }

  private handleMessageArrival() {
    if (!this.hasTimedOut) {
      Logger.debug(`${this.subscription.name} stop waiting because it has received its message`);
      this.totalTime = new DateController();
    } else {
      Logger.info(`${this.subscription.name} has received message in a unable time`);
    }
    Logger.debug(`${this.subscription.name} handled message arrival`);
  }

  private executeOnInitFunction(subscriptionAttributes: SubscriptionModel) {
    if (!subscriptionAttributes.ignore) {
      NotificationEmitter.emit(Notifications.SUBSCRIPTION_STARTED, {
        subscription: subscriptionAttributes
      });
      this.executeHookEvent(DefaultHookEvents.ON_INIT, {}, subscriptionAttributes);
    }
  }

  private async handleKillSignal(signal: Signals, type: string): Promise<void> {
    Logger.debug(`Subscription reporter '${type}' handling kill signal ${signal}`);
    await this.unsubscribe();
    Logger.debug(`Subscription reporter '${type}' unsubscribed`);
  }
}

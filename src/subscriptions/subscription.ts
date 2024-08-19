import { SubscriptionModel } from '../models/inputs/subscription-model';
import { Logger } from '../loggers/logger';
import { Event } from '../models/events/event';

export abstract class Subscription {
  public name: string;
  public messageReceived?: any;
  public timeout?: number;
  public onMessageReceived?: Event;
  public onFinish?: Event;
  public response?: any;
  public type: string;
  public avoid: boolean = false;
  public ignore: boolean = false;

  [propName: string]: any;

  protected constructor(subscriptionAttributes: SubscriptionModel) {
    Object.keys(subscriptionAttributes).forEach(key => {
      this[key] = subscriptionAttributes[key];
    });
    this.type = subscriptionAttributes.type;
    this.name = subscriptionAttributes.name;
  }

  public abstract subscribe(): Promise<void>;

  public abstract receiveMessage(): Promise<any>;

  public async unsubscribe(): Promise<void> {
    //do nothing
  }

  public async sendResponse(): Promise<void> {}

  public registerHookEventExecutor(hookEventExecutor: (eventName: string, args: any) => void) {
    this.hookEventExecutor = hookEventExecutor;
  }

  protected executeHookEvent(hookName: string, args: any = {}) {
    if (this.hookEventExecutor) {
      this.hookEventExecutor(hookName, args);
    } else {
      Logger.warning(`Hook event executor not registered in subscription`);
    }
  }
}

import { PublisherModel } from '../models/inputs/publisher-model';
import { Event } from '../models/events/event';
import { Logger } from '../loggers/logger';

export abstract class Publisher {
  public type: string;
  public payload: any;
  public name: string;
  public onMessageReceived?: Event;
  public onInit?: Event;
  public onFinish?: Event;
  public messageReceived?: any;
  public ignore: boolean = false;

  [propName: string]: any;

  protected constructor(publisherAttributes: PublisherModel) {
    Object.keys(publisherAttributes).forEach(key => {
      this[key] = publisherAttributes[key];
    });
    this.type = publisherAttributes.type;
    this.payload = publisherAttributes.payload;
    this.name = publisherAttributes.name;
  }

  public abstract publish(): Promise<any>;

  public registerHookEventExecutor(hookEventExecutor: (eventName: string, args: any) => void) {
    this.hookEventExecutorFunctor = hookEventExecutor;
  }

  protected executeHookEvent(hookName: string, args: any = {}) {
    if (this.hookEventExecutorFunctor) {
      this.hookEventExecutorFunctor(hookName, args);
    } else {
      Logger.warning(`Hook event executor not registered in publisher`);
    }
  }
}

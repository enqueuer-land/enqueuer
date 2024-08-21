import { ActuatorModel } from '../models/inputs/actuator-model';
import { Event } from '../models/events/event';
import { Logger } from '../loggers/logger';

export abstract class Actuator {
  public type: string;
  public payload: any;
  public name: string;
  public onMessageReceived?: Event;
  public onInit?: Event;
  public onFinish?: Event;
  public messageReceived?: any;
  public ignore: boolean = false;

  [propName: string]: any;

  protected constructor(actuatorAttributes: ActuatorModel) {
    Object.keys(actuatorAttributes).forEach(key => {
      this[key] = actuatorAttributes[key];
    });
    this.type = actuatorAttributes.type;
    this.payload = actuatorAttributes.payload;
    this.name = actuatorAttributes.name;
  }

  public abstract act(): Promise<any>;

  public registerHookEventExecutor(hookEventExecutor: (eventName: string, args: any) => void) {
    this.hookEventExecutorFunctor = hookEventExecutor;
  }

  protected executeHookEvent(hookName: string, args: any = {}) {
    if (this.hookEventExecutorFunctor) {
      this.hookEventExecutorFunctor(hookName, args);
    } else {
      Logger.warning(`Hook event executor not registered in actuator`);
    }
  }
}

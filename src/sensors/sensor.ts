import { SensorModel } from '../models/inputs/sensor-model';
import { Logger } from '../loggers/logger';
import { Event } from '../models/events/event';

export abstract class Sensor {
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

  protected constructor(sensorAttributes: SensorModel) {
    Object.keys(sensorAttributes).forEach(key => {
      this[key] = sensorAttributes[key];
    });
    this.type = sensorAttributes.type;
    this.name = sensorAttributes.name;
  }

  public abstract mount(): Promise<void>;

  public abstract receiveMessage(): Promise<any>;

  public async unmount(): Promise<void> {
    //do nothing
  }

  public async respond(): Promise<void> {}

  public registerHookEventExecutor(hookEventExecutor: (eventName: string, args: any) => void) {
    this.hookEventExecutor = hookEventExecutor;
  }

  protected executeHookEvent(hookName: string, args: any = {}) {
    if (this.hookEventExecutor) {
      this.hookEventExecutor(hookName, args);
    } else {
      Logger.warning(`Hook event executor not registered in sensor`);
    }
  }
}

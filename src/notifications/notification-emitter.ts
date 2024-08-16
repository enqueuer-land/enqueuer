import { EventEmitter } from 'events';
import { Logger } from '../loggers/logger';
import { Notifications } from './notifications';

export class NotificationEmitter {
  private static readonly notificationEmitter = new NotificationEmitter();

  private readonly eventEmitter = new EventEmitter();

  private constructor() {}

  public static on(event: Notifications, listener: (...args: any[]) => void): NotificationEmitter {
    NotificationEmitter.notificationEmitter.eventEmitter.on(Notifications[event], listener);
    return NotificationEmitter.notificationEmitter;
  }

  public static emit(event: Notifications, ...args: any[]): NotificationEmitter {
    Logger.trace(`Notification '${Notifications[event]}' emitted`);
    NotificationEmitter.notificationEmitter.eventEmitter.emit(Notifications[event], ...args);
    return NotificationEmitter.notificationEmitter;
  }
}

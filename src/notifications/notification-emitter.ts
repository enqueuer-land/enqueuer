import {EventEmitter} from 'events';
import {Logger} from '../loggers/logger';

export enum Notifications {
    REQUISITION_FINISHED,
    PUBLISHER_FINISHED,
    SUBSCRIPTION_FINISHED,
    HOOK_FINISHED,

    REQUISITION_STARTED,
    PUBLISHER_STARTED,
    SUBSCRIPTION_STARTED,
}

export class NotificationEmitter {
    private static readonly notificationEmitter = new NotificationEmitter();

    private readonly eventEmitter = new EventEmitter();

    private constructor() {

    }

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

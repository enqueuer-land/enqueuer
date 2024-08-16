import { NotificationEmitter } from './notification-emitter';
import { Notifications } from './notifications';

describe('NotificationEmitter', () => {
  it('Should emit notification', done => {
    const emittedNotification = { booleanValue: true, stringValue: 'string' };

    NotificationEmitter.on(Notifications.REQUISITION_FINISHED, (receivedNotification: any) => {
      expect(receivedNotification).toEqual(emittedNotification);
      done();
    });

    NotificationEmitter.emit(Notifications.REQUISITION_FINISHED, emittedNotification);
  });
});

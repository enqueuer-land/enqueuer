import {NotificationEmitter, Notifications} from './notification-emitter';

describe('NotificationEmitter', () => {
    it('Should emit notification', done => {
        const emittedNotification = {booleanValue: true, stringValue: 'string'};

        NotificationEmitter.on(Notifications.REQUISITION_RAN, (receivedNotification: any) => {
            expect(receivedNotification).toEqual(emittedNotification);
            done();
        });

        NotificationEmitter.emit(Notifications.REQUISITION_RAN, emittedNotification);
    });
});

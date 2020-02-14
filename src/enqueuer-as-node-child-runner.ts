import {RequisitionRunner} from './requisition-runners/requisition-runner';
import {NotificationEmitter} from './notifications/notification-emitter';
import {ObjectDecycler} from './object-parser/object-decycler';
import {Notifications} from './notifications/notifications';

export class EnqueuerAsNodeChildRunner {

    public execute(shouldEnd: boolean = false): Promise<number> {
        console.log('Rocking and rolling');
        this.registerSenders();
        this.registerListeners();
        return new Promise<number>(resolve => {
            if (shouldEnd) {
                resolve(0);
            }
        });
    }

    private registerListeners() {
        process.on('message', async message => {
            if (message.event === 'runRequisition') {
                await new RequisitionRunner(message.value).run();
            }
        });
        process.on('exit', (code) => {
            process.send!({
                event: 'PROCESS_EXIT',
                value: code
            });
        });
    }

    private registerSenders() {

        Object.keys(Notifications)
            .map((key: any) => Notifications[key])
            .filter((key: any) => typeof key === 'number')
            .forEach((notificationNameIndex: any) => {
                const notification = Notifications[notificationNameIndex];
                // @ts-ignore
                NotificationEmitter.on(notificationNameIndex, (report: any) => {
                    process.send!(
                        {
                            event: notification,
                            value: new ObjectDecycler().decycle(report)
                        });
                });

            });
    }

}

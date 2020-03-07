import {NotificationEmitter} from './notifications/notification-emitter';
import {ObjectDecycler} from './object-parser/object-decycler';
import {Notifications} from './notifications/notifications';
import {ParentReplier} from './run-as-child/parent-replier';
import {ChildReceivingEvents} from './run-as-child/child-receiving-events';
import {ChildRequisitionRunner} from './run-as-child/child-requisition-runner';
import {ModuleAdder} from './run-as-child/module-adder';
import {ProtocolDescriber} from './run-as-child/protocol-describer';
import {AssertDescriber} from './run-as-child/assert-describer';
import {StoreCleaner} from './run-as-child/store-cleaner';
import {ChildSendingEvents} from './run-as-child/child-sending-events';

export class EnqueuerAsNodeChildRunner {
    private readonly processors: {
        [key: string]: ParentReplier
    };

    public constructor() {
        this.processors = {
            [ChildReceivingEvents.ADD_MODULE]: new ModuleAdder(),
            [ChildReceivingEvents.CLEAN_STORE]: new StoreCleaner(),
            [ChildReceivingEvents.GET_ASSERTERS]: new AssertDescriber(),
            [ChildReceivingEvents.GET_PROTOCOLS]: new ProtocolDescriber(),
            [ChildReceivingEvents.RUN_REQUISITION]: new ChildRequisitionRunner(),
        };
    }

    public execute(): Promise<number> {
        console.log('Child is rocking and rolling');
        this.registerInternProxies();
        this.registerListeners();
        return new Promise<number>(resolve => {
            if (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() === 'TEST') {
                resolve(0);
            }
        });
    }

    private registerInternProxies() {
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

    public registerListeners(): void {
        process.on('message', async message => {
            const processor = this.processors[message.event];
            if (processor) {
                await processor.process(message);
            }
        });
        process.on('exit', (code) => {
            process.send!({
                event: ChildSendingEvents.PROCESS_EXIT,
                value: code
            });
        });
    }

}

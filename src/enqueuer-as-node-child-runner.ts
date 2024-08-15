import { Logger } from './loggers/logger';
import { ModuleAdder } from './run-as-child/module-adder';
import { StoreSetter } from './run-as-child/store-setter';
import { StoreCleaner } from './run-as-child/store-cleaner';
import { ParentReplier } from './run-as-child/parent-replier';
import { Notifications } from './notifications/notifications';
import { ObjectDecycler } from './object-parser/object-decycler';
import { AssertDescriber } from './run-as-child/assert-describer';
import { ProtocolDescriber } from './run-as-child/protocol-describer';
import { ChildSendingEvents } from './run-as-child/child-sending-events';
import { NotificationEmitter } from './notifications/notification-emitter';
import { ChildReceivingEvents } from './run-as-child/child-receiving-events';
import { ChildRequisitionRunner } from './run-as-child/child-requisition-runner';

export class EnqueuerAsNodeChildRunner {
    private readonly processors: {
        [key: string]: ParentReplier
    };

    public constructor() {
        this.processors = {
            [ChildReceivingEvents.ADD_MODULE]: new ModuleAdder(),
            [ChildReceivingEvents.CLEAN_STORE]: new StoreCleaner(),
            [ChildReceivingEvents.SET_STORE]: new StoreSetter(),
            [ChildReceivingEvents.GET_ASSERTERS]: new AssertDescriber(),
            [ChildReceivingEvents.GET_PROTOCOLS]: new ProtocolDescriber(),
            [ChildReceivingEvents.RUN_REQUISITION]: new ChildRequisitionRunner(),
        };
    }

    public execute(): Promise<number> {
        Logger.info('Enqueuer is rocking and rolling');
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
        process.on('message', async (message: { event: string }) => {
            Logger.debug(`Received from parent: ${message.event}: ${JSON.stringify(message)}`);
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

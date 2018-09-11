import {MessageReceiver} from './message-receiver';
import {Logger} from '../loggers/logger';
import {EventExecutor} from './event-executor';
import {TestModel} from '../models/outputs/test-model';

export class OnMessageReceivedEventExecutor extends EventExecutor {
    private messageReceiver: MessageReceiver;

    constructor(name: string, messageReceiver: MessageReceiver) {
        super('onMessageReceived', messageReceiver.onMessageReceived);
        this.messageReceiver = messageReceiver;

        if (typeof(this.messageReceiver.messageReceived) == 'object' && !Buffer.isBuffer(this.messageReceiver.messageReceived)) {
            Object.keys(this.messageReceiver.messageReceived).forEach((key) => {
                this.addArgument(key, this.messageReceiver.messageReceived[key]);
            });
        }
        this.addArgument('message', this.messageReceiver.messageReceived);
        this.addArgument(name, this.messageReceiver);
    }

    public trigger(): TestModel[] {
        if (!this.messageReceiver.onMessageReceived || !this.messageReceiver.messageReceived) {
            return [];
        }
        return this.execute();
    }
}
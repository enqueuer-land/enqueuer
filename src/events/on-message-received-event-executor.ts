import {MessageReceiver} from './message-receiver';
import {Logger} from '../loggers/logger';
import {EventAsserter} from './event-asserter';
import {EventExecutor} from './event-executor';
import {TestModel} from '../models/outputs/test-model';

//TODO test it
export class OnMessageReceivedEventExecutor implements EventExecutor {
    private messageReceiver: MessageReceiver;
    private name: string;

    constructor(name: string, messageReceiver: MessageReceiver) {
        this.name = name;
        this.messageReceiver = messageReceiver;
    }

    public execute(): TestModel[] {
        Logger.trace(`Executing on message received`);
        if (!this.messageReceiver.onMessageReceived || !this.messageReceiver.messageReceived) {
            Logger.trace(`No onMessageReceived to be played here`);
            return [];
        }
        return this.buildEventAsserter().assert().map(test => {
            return {name: test.label, valid: test.valid, description: test.errorDescription};
        });
    }

    private buildEventAsserter() {
        const eventTestExecutor = new EventAsserter(this.messageReceiver.onMessageReceived);
        if (typeof(this.messageReceiver.messageReceived) == 'object' && !Buffer.isBuffer(this.messageReceiver.messageReceived)) {
            Object.keys(this.messageReceiver.messageReceived).forEach((key) => {
                eventTestExecutor.addArgument(key, this.messageReceiver.messageReceived[key]);
            });
        }
        eventTestExecutor.addArgument('message', this.messageReceiver.messageReceived);
        eventTestExecutor.addArgument(this.name, this.messageReceiver);
        return eventTestExecutor;
    }
}
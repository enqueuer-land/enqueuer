import {MessageReceiver} from './message-receiver';
import {Logger} from '../loggers/logger';
import {EventTestExecutor} from './event-test-executor';
import {Test} from '../testers/test';
import {EventExecutor} from './event-executor';

export class OnMessageReceivedEventExecutor implements EventExecutor {
    private owner: MessageReceiver;

    constructor(messageReceiver: MessageReceiver) {
        this.owner = messageReceiver;
    }

    public execute(): Test[] {
        Logger.trace(`Executing on message received`);
        if (!this.owner.onMessageReceived || !this.owner.messageReceived) {
            Logger.trace(`No onMessageReceived to be played here`);
            return [];
        }
        return this.buildEventTestExecutor().execute();
    }

    private buildEventTestExecutor() {
        const eventTestExecutor = new EventTestExecutor(this.owner.onMessageReceived);
        if (typeof(this.owner.messageReceived) == 'object' && !Buffer.isBuffer(this.owner.messageReceived)) {
            Object.keys(this.owner.messageReceived).forEach((key) => {
                eventTestExecutor.addArgument(key, this.owner.messageReceived[key]);
            });
        }
        eventTestExecutor.addArgument('message', this.owner.messageReceived);
        eventTestExecutor.addArgument(this.owner.name, this.owner.value);
        return eventTestExecutor;
    }
}
import {OnMessageReceivedMetaFunctionBody} from './on-message-received-meta-function-body';
import {MetaFunctionExecutor} from './meta-function-executor';
import {Logger} from '../loggers/logger';

export class OnMessageReceivedReporter {

    private messageReceived: string;
    private onMessageReceived: string;

    public constructor(messageReceived: string, onMessageReceived: string) {
        this.messageReceived = messageReceived;
        this.onMessageReceived = onMessageReceived;
    }

    public execute(): any {
        const onMessageReceivedSubscription = new OnMessageReceivedMetaFunctionBody(this.messageReceived, this.onMessageReceived);
        const functionResponse = new MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        Logger.trace(`Response of onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        return functionResponse;
    }

}

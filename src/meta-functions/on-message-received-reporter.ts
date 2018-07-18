import {OnMessageReceivedMetaFunctionBody} from './on-message-received-meta-function-body';
import {MetaFunctionExecutor} from './meta-function-executor';
import {Logger} from '../loggers/logger';

export class OnMessageReceivedReporter {

    private messageReceived?: string;
    private onMessageReceived: string;

    public constructor(onMessageReceived: string, messageReceived?: string) {
        this.onMessageReceived = onMessageReceived;
        this.messageReceived = messageReceived;
    }

    public execute(): any {
        const onMessageReceivedSubscription = new OnMessageReceivedMetaFunctionBody(this.onMessageReceived, this.messageReceived);
        const functionResponse = new MetaFunctionExecutor(onMessageReceivedSubscription).execute();
        Logger.trace(`Response of onMessageReceived function: ${JSON.stringify(functionResponse)}`);
        return functionResponse;
    }

}

import {MetaFunctionBodyCreator} from "./meta-function-body-creator";

export class OnMessageReceivedMetaFunctionBody implements MetaFunctionBodyCreator {

    private messageReceived: string;
    private onMessageReceived: string;

    public constructor(messageReceived: string, onMessageReceived: string) {
        this.messageReceived = messageReceived;
        this.onMessageReceived = onMessageReceived;
    }

    public createBody(): string {
        return    `let test = {};
                    let report = {};
                    let message = ${JSON.stringify(this.messageReceived)};
                    ${this.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }

}
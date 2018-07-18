import {MetaFunctionBodyCreator} from './meta-function-body-creator';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {VariablesController} from '../variables/variables-controller';

export class OnMessageReceivedMetaFunctionBody implements MetaFunctionBodyCreator {

    private messageReceived?: string;
    private onMessageReceived: string;

    public constructor(onMessageReceived: string, messageReceived?: string) {
        this.onMessageReceived = onMessageReceived;
        this.messageReceived = messageReceived;
    }

    public createBody(): string {
        const onMessageReceivedObject = {onMessageReceived: this.onMessageReceived};
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        const replaced: any = placeHolderReplacer.replace(onMessageReceivedObject);

        let message = 'null';
        if (this.messageReceived) {
            message = JSON.stringify(this.messageReceived);
        }

        return    `let test = {};
                    let report = {};
                    let message = ${message};
                    ${replaced.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }

}
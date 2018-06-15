import {MetaFunctionBodyCreator} from './meta-function-body-creator';
import {JsonPlaceholderReplacer} from 'json-placeholder-replacer';
import {VariablesController} from '../variables/variables-controller';

export class OnMessageReceivedMetaFunctionBody implements MetaFunctionBodyCreator {

    private messageReceived: string;
    private onMessageReceived: string;

    public constructor(messageReceived: string, onMessageReceived: string) {
        this.messageReceived = messageReceived;
        this.onMessageReceived = onMessageReceived;
    }

    public createBody(): string {
        const onMessageReceivedObject = {onMessageReceived: this.onMessageReceived};
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        const replaced: any = placeHolderReplacer.replace(onMessageReceivedObject);

        return    `let test = {};
                    let report = {};
                    let message = ${JSON.stringify(this.messageReceived)};
                    ${replaced.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }

}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const variables_controller_1 = require("../variables/variables-controller");
class OnMessageReceivedMetaFunctionBody {
    constructor(onMessageReceived, messageReceived) {
        this.onMessageReceived = onMessageReceived;
        this.messageReceived = messageReceived;
    }
    createBody() {
        const onMessageReceivedObject = { onMessageReceived: this.onMessageReceived };
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        const replaced = placeHolderReplacer.replace(onMessageReceivedObject);
        let message = 'null';
        if (this.messageReceived) {
            message = JSON.stringify(this.messageReceived);
        }
        return `let test = {};
                    let report = {};
                    let message = ${message};
                    ${replaced.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }
}
exports.OnMessageReceivedMetaFunctionBody = OnMessageReceivedMetaFunctionBody;

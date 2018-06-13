"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const variables_controller_1 = require("../variables/variables-controller");
class OnMessageReceivedMetaFunctionBody {
    constructor(messageReceived, onMessageReceived) {
        this.messageReceived = messageReceived;
        this.onMessageReceived = onMessageReceived;
    }
    createBody() {
        const onMessageReceivedObject = { onMessageReceived: this.onMessageReceived };
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        const replaced = placeHolderReplacer.replace(onMessageReceivedObject);
        return `let test = {};
                    let report = {};
                    let message = ${JSON.stringify(this.messageReceived)};
                    ${replaced.onMessageReceived};
                    return {
                            test: test,
                            report: report
                     };`;
    }
}
exports.OnMessageReceivedMetaFunctionBody = OnMessageReceivedMetaFunctionBody;

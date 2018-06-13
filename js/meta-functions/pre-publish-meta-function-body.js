"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const json_placeholder_replacer_1 = require("json-placeholder-replacer");
const variables_controller_1 = require("../variables/variables-controller");
class PrePublishMetaFunctionBody {
    constructor(publisherAttributes) {
        this.publisherAttributes = publisherAttributes;
    }
    createBody() {
        const publisherAttributesObject = { publisherAttributes: this.publisherAttributes };
        const placeHolderReplacer = new json_placeholder_replacer_1.JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(variables_controller_1.VariablesController.persistedVariables())
            .addVariableMap(variables_controller_1.VariablesController.sessionVariables());
        const replaced = placeHolderReplacer.replace(publisherAttributesObject).publisherAttributes;
        return `let test = {};
                    let report = {};
                    let publisher = \`${JSON.stringify(replaced)}\`;
                    publisher = JSON.parse(publisher);
                    ${replaced.prePublishing};
                    return {
                            test: test,
                            report: report,
                            publisher: publisher
                     };`;
    }
}
exports.PrePublishMetaFunctionBody = PrePublishMetaFunctionBody;

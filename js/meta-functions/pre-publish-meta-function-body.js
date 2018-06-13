"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrePublishMetaFunctionBody {
    constructor(publisherAttributes) {
        this.publisherAttributes = publisherAttributes;
    }
    createBody() {
        // const publisherAttributesObject = {publisherAttributes: this.publisherAttributes};
        // const placeHolderReplacer = new JsonPlaceholderReplacer();
        // placeHolderReplacer
        //     .addVariableMap(VariablesController.persistedVariables())
        //     .addVariableMap(VariablesController.sessionVariables());
        // const replaced = (placeHolderReplacer.replace(publisherAttributesObject) as any).publisherAttributes;
        return `let test = {};
                    let report = {};
                    let publisher = \`${JSON.stringify(this.publisherAttributes)}\`;
                    publisher = JSON.parse(publisher);
                    ${this.publisherAttributes.prePublishing};
                    return {
                            test: test,
                            report: report,
                            publisher: publisher
                     };`;
    }
}
exports.PrePublishMetaFunctionBody = PrePublishMetaFunctionBody;

import {MetaFunctionBodyCreator} from "./meta-function-body-creator";
import {PublisherModel} from "../models/inputs/publisher-model";
import {JsonPlaceholderReplacer} from "json-placeholder-replacer";
import {VariablesController} from "../variables/variables-controller";

export class PrePublishMetaFunctionBody implements MetaFunctionBodyCreator {

    private publisherAttributes: PublisherModel;

    public constructor(publisherAttributes: PublisherModel) {
        this.publisherAttributes = publisherAttributes;
    }

    public createBody(): string {
        const publisherAttributesObject = {publisherAttributes: this.publisherAttributes};
        const placeHolderReplacer = new JsonPlaceholderReplacer();
        placeHolderReplacer
            .addVariableMap(VariablesController.persistedVariables())
            .addVariableMap(VariablesController.sessionVariables());
        const replaced = (placeHolderReplacer.replace(publisherAttributesObject) as any).publisherAttributes;

        return    `let test = {};
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
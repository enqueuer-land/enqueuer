import {MetaFunctionBodyCreator} from "./meta-function-body-creator";
import {PublisherModel} from "../models/publisher-model";

export class PrePublishMetaFunctionBody implements MetaFunctionBodyCreator {

    private publisherAttributes: PublisherModel;

    public constructor(publisherAttributes: PublisherModel) {
        this.publisherAttributes = publisherAttributes;
    }

    public createBody(): string {
        return    `let test = {};
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
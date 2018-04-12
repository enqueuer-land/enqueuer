import {MetaFunctionCreator} from "./meta-function-creator";
import {PublisherModel} from "../requisitions/models/publisher-model";

export class PrePublishMetaFunction implements MetaFunctionCreator {

    private publisherAttributes: PublisherModel;

    public constructor(publisherAttributes: PublisherModel) {
        this.publisherAttributes = publisherAttributes;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let publisher = \`${JSON.stringify(this.publisherAttributes)}\`;
                                    publisher = JSON.parse(publisher);
                                    ${this.publisherAttributes.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            publisher: publisher
                                     };`;
        return new Function("args", fullBody);
    }

}
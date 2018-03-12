import {MetaFunctionCreator} from "./meta-function-creator";
import {PublisherModel} from "../requisitions/model/publisher-model";

export class PrePublishFunction implements MetaFunctionCreator {

    private publisherAttributes: PublisherModel;

    public constructor(publisherAttributes: PublisherModel) {
        this.publisherAttributes = publisherAttributes;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let variables = {};
                                    let publisher = '${JSON.stringify(this.publisherAttributes)}';
                                    ${this.publisherAttributes.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            variables: variables,
                                            publisher: publisher
                                     };`;
        return new Function(fullBody);
    }

}
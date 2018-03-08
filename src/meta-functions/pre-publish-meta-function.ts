import {MetaFunctionCreator} from "./meta-function-creator";

export class PrePublishFunction implements MetaFunctionCreator {

    private publisherAttributes: any;

    public constructor(publisherAttributes: any) {
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
import {FunctionCreator} from "./function-creator";

export class PrePublishFunction implements FunctionCreator {

    private publisherAttributes: any;

    public constructor(publisherAttributes: any) {
        this.publisherAttributes = publisherAttributes;
    }

    public createFunction(): Function {
        const fullBody: string =    `let test = {};
                                    let report = {};
                                    let publisher = '${JSON.stringify(this.publisherAttributes)}';
                                    ${this.publisherAttributes.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            publisher: publisher
                                     };`;
        return new Function(fullBody);
    }

}
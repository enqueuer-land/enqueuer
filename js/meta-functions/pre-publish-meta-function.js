"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrePublishMetaFunction {
    constructor(publisherAttributes) {
        this.publisherAttributes = publisherAttributes;
    }
    createFunction() {
        const fullBody = `let test = {};
                                    let report = {};
                                    let variables = {};
                                    let publisher = \`${JSON.stringify(this.publisherAttributes)}\`;
                                    publisher = JSON.parse(publisher);
                                    ${this.publisherAttributes.prePublishing};
                                    return {
                                            test: test,
                                            report: report,
                                            variables: variables,
                                            publisher: publisher
                                     };`;
        return new Function("args", fullBody);
    }
}
exports.PrePublishMetaFunction = PrePublishMetaFunction;

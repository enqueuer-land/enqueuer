"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrePublishMetaFunction {
    constructor(publisherAttributes) {
        this.publisherAttributes = publisherAttributes;
    }
    createBody() {
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
exports.PrePublishMetaFunction = PrePublishMetaFunction;

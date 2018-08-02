"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_creator_1 = require("./result-creator");
const conditional_injector_1 = require("conditional-injector");
class MultiResultCreator extends result_creator_1.ResultCreator {
    constructor(reports) {
        super();
        this.resultCreators = [];
        reports.forEach(report => {
            this.resultCreators.push(conditional_injector_1.Container.subclassesOf(result_creator_1.ResultCreator).create(report));
        });
    }
    addTestSuite(suite) {
        this.resultCreators.forEach(result => result.addTestSuite(suite));
    }
    addError(err) {
        this.resultCreators.forEach(result => result.addError(err));
    }
    isValid() {
        return this.resultCreators.every(result => result.isValid());
    }
    create() {
        this.resultCreators.forEach(result => result.create());
    }
}
exports.MultiResultCreator = MultiResultCreator;

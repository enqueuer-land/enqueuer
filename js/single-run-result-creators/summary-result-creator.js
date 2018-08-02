"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const result_creator_1 = require("./result-creator");
class SummaryResultCreator extends result_creator_1.ResultCreator {
    constructor() {
        super();
        this.testCounter = 0;
        this.failedTestNames = [];
    }
    addTestSuite(suite) {
        this.findRequisitions(suite, '');
    }
    addError(err) {
        ++this.testCounter;
        this.failedTestNames.push(this.addLevel('', err.toString()));
    }
    isValid() {
        return this.failedTestNames.length == 0;
    }
    create() {
        console.log(`Tests summary ${this.testCounter - this.failedTestNames.length}/${this.testCounter} => ` +
            `${Math.trunc(10000 * (this.testCounter - this.failedTestNames.length) / this.testCounter) / 100}% passing`);
        if (this.failedTestNames.length > 0) {
            console.log(`Failing tests:`);
            this.failedTestNames
                .forEach((failingTest) => {
                console.log(`\t${failingTest}`);
            });
        }
    }
    findRequisitions(resultModel, prefix) {
        resultModel.runnables.forEach((runnable) => {
            const levelName = this.addLevel(prefix, resultModel.name);
            if (runnable.type == 'runnable') {
                this.findRequisitions(runnable, levelName);
            }
            else if (runnable.type == 'requisition') {
                const requisition = runnable;
                this.findTests(requisition, this.addLevel(levelName, requisition.name));
            }
        });
    }
    findTests(requisition, prefix) {
        this.inspectInvalidTests(requisition.tests, prefix);
        requisition.subscriptions.forEach(subscription => this.inspectInvalidTests(subscription.tests, this.addLevel(prefix, subscription.name)));
        if (requisition.startEvent.subscription) {
            this.inspectInvalidTests(requisition.startEvent.subscription.tests, this.addLevel(prefix, requisition.startEvent.subscription.name));
        }
        if (requisition.startEvent.publisher) {
            this.inspectInvalidTests(requisition.startEvent.publisher.tests, this.addLevel(prefix, requisition.startEvent.publisher.name));
        }
    }
    inspectInvalidTests(tests, prefix) {
        this.testCounter += Object.keys(tests).length;
        Object.keys(tests)
            .forEach((key) => {
            if (!tests[key]) {
                this.failedTestNames.push(this.addLevel(prefix, key));
            }
        });
    }
    addLevel(prefix, newLevelName) {
        return prefix.concat(' -> ').concat(newLevelName);
    }
}
exports.SummaryResultCreator = SummaryResultCreator;

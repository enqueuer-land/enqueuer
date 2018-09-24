"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestsCounter {
    constructor() {
        this.totalTests = 0;
        this.failingTests = 0;
    }
    addRequisitionTest(report) {
        this.findRequisitions([report]);
    }
    addTest(test) {
        this.sumTests([test]);
    }
    getTestsNumber() {
        return this.totalTests;
    }
    getFailingTestsNumber() {
        return this.failingTests;
    }
    getPercentage() {
        let percentage = Math.trunc(10000 * (this.totalTests - this.failingTests) / this.totalTests) / 100;
        if (isNaN(percentage)) {
            percentage = 100;
        }
        return percentage;
    }
    findRequisitions(reports = []) {
        reports.forEach((requisition) => {
            this.findRequisitions(requisition.requisitions);
            this.findTests(requisition);
        });
    }
    findTests(requisition) {
        this.sumTests(requisition.tests);
        if (requisition.subscriptions) {
            requisition.subscriptions
                .forEach(subscription => this.sumTests(subscription.tests));
        }
        if (requisition.publishers) {
            requisition.publishers
                .forEach(publisher => this.sumTests(publisher.tests));
        }
    }
    sumTests(tests) {
        this.failingTests += tests.filter(test => !test.valid).length;
        this.totalTests += tests.length;
    }
}
exports.TestsCounter = TestsCounter;

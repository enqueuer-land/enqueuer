"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const result_creator_1 = require("./result-creator");
const chalk_1 = __importDefault(require("chalk"));
const date_controller_1 = require("../timers/date-controller");
class SummaryResultCreator extends result_creator_1.ResultCreator {
    constructor() {
        super();
        this.testCounter = 0;
        this.failingTests = [];
        this.startTime = new date_controller_1.DateController();
    }
    addTestSuite(name, report) {
        this.findRequisitions(report, [name]);
    }
    addError(err) {
        ++this.testCounter;
        this.failingTests.push({ name: 'Error running runnable', valid: false, description: err.toString() });
    }
    isValid() {
        return this.failingTests.length == 0;
    }
    create() {
        this.printSummary();
        if (this.failingTests.length > 0) {
            console.log(chalk_1.default.red(`\t\tFailing tests:`));
            this.failingTests
                .forEach((failingTest) => {
                let message = '\t\t\t';
                message += this.createTestHierarchyMessage(failingTest.hierarchy, failingTest.name, chalk_1.default.red);
                console.log(message);
                console.log(chalk_1.default.red(`\t\t\t\t\t ${failingTest.description}`));
            });
        }
    }
    findRequisitions(resultModel, hierarchy) {
        resultModel.runnables.forEach((runnable) => {
            const levelName = hierarchy.concat(resultModel.name);
            if (runnable.type == 'runnable') {
                this.findRequisitions(runnable, levelName);
            }
            else if (runnable.type == 'requisition') {
                const requisition = runnable;
                this.findTests(requisition, levelName.concat(requisition.name));
            }
        });
    }
    findTests(requisition, hierarchy) {
        this.inspectInvalidTests(requisition.tests, hierarchy);
        requisition.subscriptions.forEach(subscription => this.inspectInvalidTests(subscription.tests, hierarchy.concat(subscription.name)));
        if (requisition.startEvent.subscription) {
            this.inspectInvalidTests(requisition.startEvent.subscription.tests, hierarchy.concat(requisition.startEvent.subscription.name));
        }
        if (requisition.startEvent.publisher) {
            this.inspectInvalidTests(requisition.startEvent.publisher.tests, hierarchy.concat(requisition.startEvent.publisher.name));
        }
    }
    inspectInvalidTests(tests, hierarchy) {
        this.testCounter += Object.keys(tests).length;
        tests
            .forEach((test) => {
            if (!test.valid) {
                this.failingTests.push(Object.assign({}, test, { hierarchy: hierarchy }));
                let message = `\t${chalk_1.default.black.bgRed('[FAIL]')} `;
                message += this.createTestHierarchyMessage(hierarchy, test.name, chalk_1.default.red);
                console.log(message);
                console.log(chalk_1.default.red(`\t\t ${test.description}`));
            }
            else {
                let message = `\t${chalk_1.default.black.bgGreen('[PASS]')} `;
                message += this.createTestHierarchyMessage(hierarchy, test.name, chalk_1.default.green);
                console.log(message);
            }
        });
    }
    createTestHierarchyMessage(hierarchy, name, color) {
        if (!hierarchy || hierarchy.length == 0) {
            return '';
        }
        return hierarchy.map((level) => color(level)).join(chalk_1.default.gray(' › ')) + chalk_1.default.gray(' › ') + chalk_1.default.reset(name);
    }
    printSummary() {
        const totalTime = new date_controller_1.DateController().getTime() - this.startTime.getTime();
        console.log(chalk_1.default.white(`------------------------------`));
        let percentage = this.calcPercentage();
        const divisionString = `${this.testCounter - this.failingTests.length} tests passing of ${this.testCounter} total ` +
            `(${percentage}%) ran in ${totalTime}ms`;
        console.log(this.percentageColor(percentage)(`\tTests summary \t\t ${divisionString}`));
    }
    calcPercentage() {
        let percentage = Math.trunc(10000 * (this.testCounter - this.failingTests.length) / this.testCounter) / 100;
        if (isNaN(percentage)) {
            percentage = 0;
        }
        return percentage;
    }
    percentageColor(percentage) {
        if (percentage == 100) {
            return chalk_1.default.bgGreen.black;
        }
        else if (percentage > 50) {
            return chalk_1.default.bgYellow.black;
        }
        return chalk_1.default.bgRed.black;
    }
}
exports.SummaryResultCreator = SummaryResultCreator;

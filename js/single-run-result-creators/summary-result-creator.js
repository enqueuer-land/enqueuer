"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const result_creator_1 = require("./result-creator");
const chalk_1 = __importDefault(require("chalk"));
class SummaryResultCreator extends result_creator_1.ResultCreator {
    constructor() {
        super();
        this.testCounter = 0;
        this.failingTests = [];
    }
    addTestSuite(suite) {
        this.findRequisitions(suite, '');
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
                console.log(chalk_1.default.red(`\t\t\tName: ${failingTest.name}`));
                console.log(chalk_1.default.red(`\t\t\t\t${failingTest.description}`));
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
        tests
            .forEach((test) => {
            const testHierarchy = this.addLevel(prefix, test.name);
            if (!test.valid) {
                test.name = testHierarchy;
                this.failingTests.push(test);
                console.log(chalk_1.default.red(`\t[FAIL] ${testHierarchy}`));
                console.log(chalk_1.default.red(`\t\t ${test.description}`));
            }
            else {
                console.log(chalk_1.default.green(`\t[PASS] ${testHierarchy}`));
            }
        });
    }
    addLevel(prefix, newLevelName) {
        return prefix.concat(' -> ').concat(newLevelName);
    }
    printSummary() {
        console.log(chalk_1.default.white(`------------------------------`));
        const divisionString = `${this.testCounter - this.failingTests.length}/${this.testCounter}`;
        const percentage = Math.trunc(10000 * (this.testCounter - this.failingTests.length) / this.testCounter) / 100;
        console.log(this.percentageColor(percentage)(`\tTests summary` +
            `\t\tPassing tests: ${divisionString} => ${percentage}%`));
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

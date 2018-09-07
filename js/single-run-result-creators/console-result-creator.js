"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const date_controller_1 = require("../timers/date-controller");
const tests_counter_1 = require("./tests-counter");
const configuration_1 = require("../configurations/configuration");
class ConsoleResultCreator {
    constructor() {
        this.failingTests = [];
        this.startTime = new date_controller_1.DateController();
        this.testsCounter = new tests_counter_1.TestsCounter();
        this.loggable = !configuration_1.Configuration.getValues().quiet;
    }
    addTestSuite(name, report) {
        this.testsCounter.addTests(report);
        this.findRequisitions([report], []);
    }
    addError(err) {
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
    findRequisitions(requisitions = [], hierarchy) {
        requisitions.forEach((requisition) => {
            const levelName = hierarchy.concat(requisition.name);
            this.findRequisitions(requisition.requisitions, levelName);
            this.findTests(requisition, levelName);
        });
    }
    findTests(requisition, hierarchy) {
        this.inspectTests(requisition.tests, hierarchy);
        if (requisition.subscriptions) {
            requisition.subscriptions.forEach(subscription => this.inspectTests(subscription.tests, hierarchy.concat(subscription.name)));
        }
        const startEvent = this.detectStartEvent(requisition);
        if (startEvent) {
            this.inspectTests(startEvent.tests, hierarchy.concat(startEvent.name));
        }
    }
    detectStartEvent(requisition) {
        if (requisition.startEvent.subscription) {
            return requisition.startEvent.subscription;
        }
        else if (requisition.startEvent.publisher) {
            return requisition.startEvent.publisher;
        }
    }
    inspectTests(tests, hierarchy) {
        tests.forEach((test) => {
            if (!test.valid) {
                this.failingTests.push(Object.assign({}, test, { hierarchy: hierarchy }));
                let message = `\t${chalk_1.default.black.bgRed('[FAIL]')} `;
                message += this.createTestHierarchyMessage(hierarchy, test.name, chalk_1.default.red);
                message += '\n' + chalk_1.default.red(`\t\t ${test.description}`);
                console.log(message);
            }
            else {
                let message = `\t${chalk_1.default.black.bgGreen('[PASS]')} `;
                message += this.createTestHierarchyMessage(hierarchy, test.name, chalk_1.default.green);
                if (this.loggable) {
                    console.log(message);
                }
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
        const percentage = this.testsCounter.getPercentage();
        const testsNumber = this.testsCounter.getTestsNumber();
        const divisionString = `${testsNumber - this.testsCounter.getFailingTestsNumber()} tests passing of ${testsNumber} total ` +
            `(${percentage}%) ran in ${totalTime}ms`;
        console.log(this.getColor(percentage)(`\tTests summary \t\t ${divisionString}`));
    }
    getColor(percentage) {
        if (percentage == 100) {
            return chalk_1.default.bgGreen.black;
        }
        else if (percentage > 50) {
            return chalk_1.default.bgYellow.black;
        }
        return chalk_1.default.bgRed.black;
    }
}
exports.ConsoleResultCreator = ConsoleResultCreator;

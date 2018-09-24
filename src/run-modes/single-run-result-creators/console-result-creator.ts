import {ResultCreator} from './result-creator';
import {TestModel} from '../../models/outputs/test-model';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import chalk from 'chalk';
import {DateController} from '../../timers/date-controller';
import {TestsCounter} from './tests-counter';
import {Configuration} from '../../configurations/configuration';

export class ConsoleResultCreator implements ResultCreator {
    private failingTests: any = [];
    private startTime: DateController;
    private testsCounter: TestsCounter;
    private loggable: boolean;

    public constructor() {
        this.startTime = new DateController();
        this.testsCounter = new TestsCounter();
        this.loggable = !Configuration.getValues().quiet;
    }

    public addTestSuite(name: string, report: RequisitionModel): void {
        this.testsCounter.addRequisitionTest(report);
        this.printSuiteResult(name, report);
        this.findRequisitions([report], []);
    }

    public addError(err: any): void {
        const test = {name: 'Error running runnable', valid: false, description: err.toString()};
        this.testsCounter.addTest(test);
        this.failingTests.push(test);
    }

    public isValid(): boolean {
        return this.failingTests.length == 0;
    }

    public create(): void {
        this.printSummary();
        if (this.failingTests.length > 0) {
            console.log(chalk.red(`\t\tFailing tests:`));
            this.failingTests
                .forEach((failingTest: any) => {
                    let message = '\t\t\t';
                    message += this.createTestHierarchyMessage(failingTest.hierarchy, failingTest.name, chalk.red);
                    console.log(message);
                    console.log(chalk.red(`\t\t\t\t\t ${failingTest.description}`));
                });
        }
    }

    private findRequisitions(requisitions: RequisitionModel[] = [], hierarchy: string[]) {
        requisitions.forEach((requisition: RequisitionModel) => {
            const levelName = hierarchy.concat(requisition.name);
            this.findRequisitions(requisition.requisitions, levelName);
            this.findTests(requisition, levelName);
        });
    }

    private findTests(requisition: RequisitionModel, hierarchy: string[]) {
        this.inspectTests(requisition.tests, hierarchy);
        if (requisition.subscriptions) {
            requisition.subscriptions.forEach(subscription => this.inspectTests(subscription.tests, hierarchy.concat(subscription.name)));
        }
        if (requisition.publishers) {
            requisition.publishers.forEach(publisher => this.inspectTests(publisher.tests, hierarchy.concat(publisher.name)));
        }
    }

    private inspectTests(tests: TestModel[], hierarchy: string[]) {
        tests.forEach((test: TestModel) => {
            if (!test.valid) {
                this.failingTests.push(Object.assign({}, test, {hierarchy: hierarchy}));
                let message = `\t${chalk.black.bgRed('[FAIL]')} `;
                message += this.createTestHierarchyMessage(hierarchy, test.name, chalk.red);
                message += '\n' + chalk.red(`\t\t ${test.description}`);
                console.log(message);
            }/* else {
                let message = `\t${chalk.black.bgGreen('[PASS]')} `;
                message += this.createTestHierarchyMessage(hierarchy, test.name, chalk.green);
                if (this.loggable) {
                    console.log(message);
                }
            }*/
        });
    }

    private createTestHierarchyMessage(hierarchy: string[], name: string, color: Function) {
        if (!hierarchy || hierarchy.length == 0) {
            return '';
        }
        return hierarchy.map((level: string) => color(level)).join(chalk.gray(' › ')) + chalk.gray(' › ') + chalk.reset(name);
    }

    private printSummary() {
        const totalTime = new DateController().getTime() - this.startTime.getTime();
        console.log(chalk.white(`------------------------------`));
        const percentage = this.testsCounter.getPercentage();
        const testsNumber = this.testsCounter.getTestsNumber();
        const divisionString = `${testsNumber - this.testsCounter.getFailingTestsNumber()} tests passing of ${testsNumber} total ` +
                                            `(${percentage}%) ran in ${totalTime}ms`;
        console.log(this.getColor(percentage)(`\tTests summary \t\t ${divisionString}`));
    }

    private getColor(percentage: number): Function {
        if (percentage == 100) {
            return chalk.bgGreen.black;
        } else if (percentage > 50) {
            return chalk.bgYellow.black;
        }
        return chalk.bgRed.black;
    }

    private printSuiteResult(name: string, report: RequisitionModel) {
        if (!report.valid) {
            let message = `\t${chalk.black.bgRed('[FAIL]')} `;
            message += chalk.red(name);
            console.log(message);
        } else {
            let message = `\t${chalk.black.bgGreen('[PASS]')} `;
            message += chalk.green(name);
            console.log(message);
        }
    }
}
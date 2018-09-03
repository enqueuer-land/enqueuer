import {ResultCreator} from './result-creator';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import chalk from 'chalk';
import {DateController} from '../timers/date-controller';
import {TestsCounter} from './tests-counter';

export class ConsoleResultCreator implements ResultCreator {
    private failingTests: any = [];
    private startTime: DateController;
    private testsCounter: TestsCounter;

    public constructor() {
        this.startTime = new DateController();
        this.testsCounter = new TestsCounter();
    }

    public addTestSuite(name: string, report: RequisitionModel): void {
        this.testsCounter.addTests(report);
        this.findRequisitions([report], [name]);
    }

    public addError(err: any): void {
        this.failingTests.push({name: 'Error running runnable', valid: false, description: err.toString()});
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
        this.inspectInvalidTests(requisition.tests, hierarchy);
        if (requisition.subscriptions) {
            requisition.subscriptions.forEach(subscription => this.inspectInvalidTests(subscription.tests, hierarchy.concat(subscription.name)));
        }
        const startEvent = this.detectStartEvent(requisition);
        if (startEvent) {
            this.inspectInvalidTests(startEvent.tests, hierarchy.concat(startEvent.name));
        }
    }

    private detectStartEvent(requisition: RequisitionModel): any {
        if (requisition.startEvent.subscription) {
            return requisition.startEvent.subscription;
        } else if (requisition.startEvent.publisher) {
            return requisition.startEvent.publisher;
        }
    }

    private inspectInvalidTests(tests: TestModel[], hierarchy: string[]) {
        tests
            .forEach((test: TestModel) => {
                if (!test.valid) {
                    this.failingTests.push(Object.assign({}, test, {hierarchy: hierarchy}));
                    let message = `\t${chalk.black.bgRed('[FAIL]')} `;
                    message += this.createTestHierarchyMessage(hierarchy, test.name, chalk.red);
                    console.log(message);
                    console.log(chalk.red(`\t\t ${test.description}`));
                } else {
                    let message = `\t${chalk.black.bgGreen('[PASS]')} `;
                    message += this.createTestHierarchyMessage(hierarchy, test.name, chalk.green);
                    console.log(message);
                }
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
}
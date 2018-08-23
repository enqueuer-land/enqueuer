import {ResultModel} from '../models/outputs/result-model';
import {ResultCreator} from './result-creator';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import chalk from 'chalk';
import {DateController} from '../timers/date-controller';

export class SummaryResultCreator implements ResultCreator {
    private testCounter: number = 0;
    private failingTests: any = [];
    private startTime: DateController;

    public constructor() {
        this.startTime = new DateController();
    }

    public addTestSuite(name: string, report: ResultModel): void {
        this.findRequisitions(report, [name]);
    }

    public addError(err: any): void {
        ++this.testCounter;
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

    private findRequisitions(resultModel: ResultModel, hierarchy: string[]) {
        resultModel.runnables.forEach((runnable: ResultModel | RequisitionModel) => {
            const levelName = hierarchy.concat(resultModel.name);
            if (runnable.type == 'runnable') {
                this.findRequisitions(runnable as ResultModel, levelName);
            } else if (runnable.type == 'requisition') {
                const requisition = runnable as RequisitionModel;
                this.findTests(requisition, levelName.concat(requisition.name));
            }
        });
    }

    private findTests(requisition: RequisitionModel, hierarchy: string[]) {
        this.inspectInvalidTests(requisition.tests, hierarchy);
        requisition.subscriptions.forEach(subscription => this.inspectInvalidTests(subscription.tests, hierarchy.concat(subscription.name)));
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
        this.testCounter += Object.keys(tests).length;
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
        let percentage = this.calcPercentage();
        const divisionString = `${this.testCounter - this.failingTests.length} tests passing of ${this.testCounter} total ` +
                                            `(${percentage}%) ran in ${totalTime}ms`;
        console.log(this.percentageColor(percentage)(`\tTests summary \t\t ${divisionString}`));
    }

    private calcPercentage() {
        let percentage = Math.trunc(10000 * (this.testCounter - this.failingTests.length) / this.testCounter) / 100;
        if (isNaN(percentage)) {
            percentage = 0;
        }
        return percentage;
    }

    private percentageColor(percentage: number): Function {
        if (percentage == 100) {
            return chalk.bgGreen.black;
        } else if (percentage > 50) {
            return chalk.bgYellow.black;
        }
        return chalk.bgRed.black;
    }
}
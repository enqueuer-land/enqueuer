import {ResultModel} from '../models/outputs/result-model';
import {ResultCreator} from './result-creator';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import chalk from 'chalk';

export class SummaryResultCreator extends ResultCreator {
    private testCounter: number = 0;
    private failingTests: TestModel[] = [];

    public constructor() {
        super();
    }

    public addTestSuite(name: string, report: ResultModel): void {
        this.findRequisitions(report, name);
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
                .forEach((failingTest) => {
                    console.log(chalk.red(`\t\t\tName: ${failingTest.name}`));
                    console.log(chalk.red(`\t\t\t\t${failingTest.description}`));
                });
        }
    }

    private findRequisitions(resultModel: ResultModel, prefix: string) {
        resultModel.runnables.forEach((runnable: ResultModel | RequisitionModel) => {
            const levelName = this.addLevel(prefix, resultModel.name);
            if (runnable.type == 'runnable') {
                this.findRequisitions(runnable, levelName);
            } else if (runnable.type == 'requisition') {
                const requisition = runnable as RequisitionModel;
                this.findTests(requisition, this.addLevel(levelName, requisition.name));
            }
        });
    }

    private findTests(requisition: RequisitionModel, prefix: string) {
        this.inspectInvalidTests(requisition.tests, prefix);
        requisition.subscriptions.forEach(subscription =>
                                        this.inspectInvalidTests(subscription.tests, this.addLevel(prefix, subscription.name)));
        if (requisition.startEvent.subscription) {
            this.inspectInvalidTests(requisition.startEvent.subscription.tests, this.addLevel(prefix, requisition.startEvent.subscription.name));
        }
        if (requisition.startEvent.publisher) {
            this.inspectInvalidTests(requisition.startEvent.publisher.tests, this.addLevel(prefix, requisition.startEvent.publisher.name));
        }
    }

    private inspectInvalidTests(tests: TestModel[], prefix: string) {
        this.testCounter += Object.keys(tests).length;
        tests
            .forEach((test: TestModel) => {
                const testHierarchy = this.addLevel(prefix, test.name);
                if (!test.valid) {
                    test.name = testHierarchy;
                    this.failingTests.push(test);
                    console.log(chalk.red(`\t[FAIL] ${testHierarchy}`));
                    console.log(chalk.red(`\t\t ${test.description}`));
                } else {
                    console.log(chalk.green(`\t[PASS] ${testHierarchy}`));
                }
            });
    }

    private addLevel(prefix: string, newLevelName: string) {
        return prefix.concat(' -> ').concat(newLevelName);
    }

    private printSummary() {
        console.log(chalk.white(`------------------------------`));
        const divisionString = `${this.testCounter - this.failingTests.length}/${this.testCounter}`;
        const percentage = Math.trunc(10000 * (this.testCounter - this.failingTests.length) / this.testCounter) / 100;
        console.log(this.percentageColor(percentage)(`\tTests summary` +
                                                            `\t\tPassing tests: ${divisionString} => ${percentage}%`));
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
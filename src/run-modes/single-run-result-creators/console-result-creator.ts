import {ResultCreator} from './result-creator';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import chalk from 'chalk';
import {DateController} from '../../timers/date-controller';
import {TestsAnalyzer, Test} from './tests-analyzer';

export class ConsoleResultCreator implements ResultCreator {
    private startTime: DateController;
    private testAnalyzer: TestsAnalyzer;

    public constructor() {
        this.startTime = new DateController();
        this.testAnalyzer = new TestsAnalyzer();
    }

    public addTestSuite(name: string, report: RequisitionModel): void {
        this.testAnalyzer.addTest(report);
        this.printSuiteResult(name, report);
    }

    public addError(err: any): void {
        const test = {name: 'Error running runnable', valid: false, description: err.toString(), tests: []};
        this.testAnalyzer.addTest(test);
    }

    public isValid(): boolean {
        return this.testAnalyzer.getFailingTests().length == 0;
    }

    public create(): void {
        this.printSummary();
        if (this.testAnalyzer.getFailingTests().length > 0) {
            console.log(chalk.red(`\t\tFailing tests:`));
            this.testAnalyzer.getFailingTests()
                .forEach((failingTest: Test) => {
                    let message = '\t\t\t';
                    message += this.createTestHierarchyMessage(failingTest.hierarchy, failingTest.test.name, chalk.red);
                    console.log(message);
                    console.log(chalk.red(`\t\t\t\t\t ${failingTest.test.description}`));
                });
        }
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
        const percentage = this.testAnalyzer.getPercentage();
        const testsNumber = this.testAnalyzer.getTests().length;
        const divisionString = `${this.testAnalyzer.getPassingTests().length} tests passing of ${testsNumber} total ` +
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

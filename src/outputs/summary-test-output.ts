import {RequisitionModel} from '../models/outputs/requisition-model';
import chalk from 'chalk';
import {Test, TestsAnalyzer} from './tests-analyzer';

export class SummaryTestOutput {
    private testAnalyzer: TestsAnalyzer;
    private report: RequisitionModel;

    public constructor(report: RequisitionModel) {
        this.report = report;
        this.testAnalyzer = new TestsAnalyzer(report);
    }

    public print() {
        let message = '';
        if (this.report.valid) {
            message = `\t${chalk.black.bgGreen('[PASS]')} `;
            message += chalk.green(this.formatName());
        } else {
            message = `\t${chalk.black.bgRed('[FAIL]')} `;
            message += chalk.red(this.formatName());
        }
        message += this.createSummary();
        console.log(message);
        if (this.testAnalyzer.getFailingTests().length > 0) {
            this.printFailingTests();
        }
    }

    private formatName(): string {
        let formattedString = this.report.name;
        while (formattedString.length < 40) {
            formattedString = formattedString.concat(' ');
        }
        return formattedString;
    }

    private createSummary(): string {
        const percentage = this.testAnalyzer.getPercentage();
        const testsNumber = this.testAnalyzer.getTests().length;
        let message = `${this.testAnalyzer.getPassingTests().length} tests passing of ${testsNumber} (${percentage}%)`;
        if (this.report.time) {
            const totalTime = this.report.time.totalTime;
            message += ` ran in ${totalTime}ms`;
        }
        return this.getColor(percentage)(message);
    }

    private getColor(percentage: number): Function {
        if (percentage == 100) {
            return chalk.green;
        } else if (percentage > 50) {
            return chalk.yellow;
        }
        return chalk.red;
    }

    private printFailingTests() {
        this.testAnalyzer.getFailingTests()
            .forEach((failingTest: Test) => {
                let message = '\t\t\t';
                message += this.prettifyTestHierarchyMessage(failingTest.hierarchy, failingTest.test.name, chalk.red);
                console.log(message);
                console.log(chalk.red(`\t\t\t\t\t ${failingTest.test.description}`));
            });
    }

    private prettifyTestHierarchyMessage(hierarchy: string[], name: string, color: Function) {
        if (!hierarchy || hierarchy.length == 0) {
            return '';
        }
        return hierarchy.map((level: string) => color(level)).join(chalk.gray(' › ')) + chalk.gray(' › ') + chalk.reset(name);
    }

}

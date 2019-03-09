import {RequisitionModel} from '../models/outputs/requisition-model';
import chalk from 'chalk';
import {AnalyzedTest, TestsAnalyzer} from './tests-analyzer';

export class SummaryTestOutput {
    private static readonly NAME_SPACING = 120;
    private static readonly LEVEL_TABULATION = 8;
    private readonly level: number;
    private testAnalyzer: TestsAnalyzer;
    private report: RequisitionModel;

    public constructor(report: RequisitionModel) {
        this.report = report;
        this.level = this.report.level || 0;
        this.testAnalyzer = new TestsAnalyzer().addTest(report);
    }

    public print(): void {
        console.log(this.formatTitle() + this.createSummary());
        if (this.testAnalyzer.getFailingTests().length > 0) {
            this.printFailingTests();
        }
    }

    private formatTitle(): string {
        const tabulation = this.level * SummaryTestOutput.LEVEL_TABULATION;
        let formattedString = '\t' + this.createEmptySpaceUntilTotalLength(0, tabulation);
        if (this.report.ignored) {
            formattedString += `${chalk.black.bgYellow('[SKIP]')} `;
            formattedString += chalk.yellow(this.report.name);
        } else if (this.report.valid) {
            formattedString += `${chalk.black.bgGreen('[PASS]')} `;
            formattedString += chalk.green(this.report.name);
        } else {
            formattedString += `${chalk.black.bgRed('[FAIL]')} `;
            formattedString += chalk.red(this.report.name);
        }
        formattedString += this.createEmptySpaceUntilTotalLength(formattedString.length, SummaryTestOutput.NAME_SPACING);
        return formattedString;
    }

    private createEmptySpaceUntilTotalLength(initialLength: number, length: number): string {
        let blank = '';
        while (initialLength + blank.length < length) {
            blank = blank.concat(' ');
        }
        return blank;
    }

    private createSummary(): string {
        const percentage = this.testAnalyzer.getPercentage();
        const testsNumber = this.testAnalyzer.getTests().length;
        let message = `${this.testAnalyzer.getPassingTests().length} tests passing of ${testsNumber} (${percentage}%)`;
        const ignoredTests = this.testAnalyzer.getIgnoredList();
        if (ignoredTests.length > 0) {
            message += ` - ${ignoredTests.length} ignored -`;
        }
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
            .forEach((failingTest: AnalyzedTest) => {
                let message = '\t\t\t';
                message += this.prettifyTestHierarchyMessage(failingTest.hierarchy, failingTest.name, chalk.red);
                console.log(message);
                console.log(chalk.red(`\t\t\t\t\t ${failingTest.description}`));
            });
    }

    private prettifyTestHierarchyMessage(hierarchy: string[], name: string, color: Function) {
        if (!hierarchy || hierarchy.length == 0) {
            return '';
        }
        return hierarchy.map((level: string) => color(level)).join(chalk.gray(' › ')) + chalk.gray(' › ') + chalk.reset(name);
    }

}

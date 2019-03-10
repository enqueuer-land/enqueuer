import chalk from 'chalk';
import {AnalyzedTest, TestsAnalyzer} from './tests-analyzer';
import {ReportModel} from '../models/outputs/report-model';
import {Configuration} from '../configurations/configuration';

//TODO test it
export class SummaryTestOutput {
    private static readonly NAME_SPACING = 120;
    private static readonly LEVEL_TABULATION = 8;
    private readonly report: ReportModel;
    private readonly level: number;
    private readonly recursive: boolean;

    public constructor(report: ReportModel, level: number = 0, recursive: boolean = false) {
        this.report = report;
        this.level = level;
        this.recursive = recursive;
    }

    public print(): void {
        if (this.level <= Configuration.getInstance().getMaxReportLevelPrint()) {
            this.printChildren();
            const testAnalyzer = new TestsAnalyzer().addTest(this.report);
            console.log(this.formatTitle(testAnalyzer) + this.createSummary(testAnalyzer));
            if (testAnalyzer.getFailingTests().length > 0) {
                this.printFailingTests(testAnalyzer);
            }
        }
    }

    private printChildren() {
        let reportLeaves = (this.report.subscriptions || []).concat(this.report.publishers || []);
        if (this.recursive) {
            reportLeaves = reportLeaves.concat(this.report.requisitions || []);
        }
        for (const leaf of reportLeaves) {
            new SummaryTestOutput(leaf, this.level + 1, this.recursive).print();
        }
    }

    private formatTitle(testAnalyzer: TestsAnalyzer): string {
        const tabulation = this.level * SummaryTestOutput.LEVEL_TABULATION;
        let formattedString = '\t' + this.createEmptySpaceUntilTotalLength(0, tabulation);
        if (this.report.ignored || testAnalyzer.getNotIgnoredTests().length === 0 ) {
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

    private createSummary(testAnalyzer: TestsAnalyzer): string {
        const percentage = testAnalyzer.getPercentage();
        const testsNumber = testAnalyzer.getTests().length;
        let message = `${testAnalyzer.getPassingTests().length} tests passing of ${testsNumber} (${percentage}%)`;
        const ignoredTests = testAnalyzer.getIgnoredList();
        if (ignoredTests.length > 0) {
            message += ` - ${ignoredTests.length} ignored -`;
        }
        if (this.report.time) {
            const totalTime = this.report.time.totalTime;
            message += ` ran in ${totalTime}ms`;
        }
        return this.getColor(percentage)(message);
    }

    private printFailingTests(testAnalyzer: TestsAnalyzer) {
        testAnalyzer.getFailingTests()
            .forEach((failingTest: AnalyzedTest) => {
                let message = '\t\t\t';
                message += this.prettifyTestHierarchyMessage(failingTest.hierarchy, failingTest.name, chalk.red);
                console.log(message);
                console.log(chalk.red(`\t\t\t\t\t ${failingTest.description}`));
            });
    }

    private getColor(percentage: number): Function {
        if (percentage == 100) {
            return chalk.green;
        } else if (percentage > 50) {
            return chalk.yellow;
        }
        return chalk.red;
    }

    private prettifyTestHierarchyMessage(hierarchy: string[], name: string, color: Function) {
        if (!hierarchy || hierarchy.length == 0) {
            return '';
        }
        return hierarchy.map((level: string) => color(level)).join(chalk.gray(' › ')) + chalk.gray(' › ') + chalk.reset(name);
    }

}

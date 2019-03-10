import chalk from 'chalk';
import {AnalyzedTest, TestsAnalyzer} from './tests-analyzer';
import {ReportModel} from '../models/outputs/report-model';

export type SummaryOptions = {
    maxLevel?: number,
    level?: number,
    printFailingTests?: boolean,
    tabulationPerLevel?: number,
    summarySpacing?: number
};

export class SummaryTestOutput {
    private readonly report: ReportModel;
    private readonly options = {
        level: 0,
        printFailingTests: true,
        maxLevel: 100,
        tabulationPerLevel: 5,
        summarySpacing: 110
    };

    public constructor(report: ReportModel, options?: SummaryOptions) {
        this.report = report;
        this.options = Object.assign({}, this.options, options);
    }

    public print(): void {
        if (this.options.maxLevel === undefined || this.options.level <= this.options.maxLevel) {
            this.printChildren();
            this.printSelf();
        }
    }

    private printChildren() {
        const reportLeaves = (this.report.subscriptions || []).concat(this.report.publishers || []);
        for (const leaf of reportLeaves) {
            new SummaryTestOutput(leaf, {
                maxLevel: this.options.maxLevel,
                level: this.options.level + 1,
                printFailingTests: false
            }).print();
        }
    }

    private printSelf() {
        const testAnalyzer = new TestsAnalyzer().addTest(this.report);
        console.log(this.formatTitle(testAnalyzer) + this.createSummary(testAnalyzer));
        if (this.options.printFailingTests && testAnalyzer.getFailingTests().length > 0) {
            this.printFailingTests(testAnalyzer);
        }
    }

    private formatTitle(testAnalyzer: TestsAnalyzer): string {
        let formattedString = this.createEmptyStringSized(2 * this.options.tabulationPerLevel);
        let nameColorFunction;
        if (this.report.ignored || testAnalyzer.getNotIgnoredTests().length === 0) {
            formattedString += `${chalk.black.bgYellow('[SKIP]')} `;
            nameColorFunction = chalk.yellow;
        } else if (this.report.valid) {
            formattedString += `${chalk.black.bgGreen('[PASS]')} `;
            nameColorFunction = chalk.green;
        } else {
            formattedString += `${chalk.black.bgRed('[FAIL]')} `;
            nameColorFunction = chalk.red;
        }
        formattedString += this.createEmptyStringSized(this.options.level * this.options.tabulationPerLevel);
        formattedString += nameColorFunction(this.report.name);
        formattedString += this.createEmptyStringSized(this.options.summarySpacing - formattedString.length);
        return formattedString;
    }

    private createEmptyStringSized(length: number): string {
        let blank = '';
        while (--length > 0) {
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
                let initialTabulation = this.createEmptyStringSized((this.options.level + 4) * this.options.tabulationPerLevel);
                let message = initialTabulation;
                message += this.prettifyTestHierarchyMessage(failingTest.hierarchy, failingTest.name, chalk.red);
                console.log(message);
                initialTabulation += this.createEmptyStringSized(2 * this.options.tabulationPerLevel);
                console.log(chalk.red(`${initialTabulation} ${failingTest.description}`));
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

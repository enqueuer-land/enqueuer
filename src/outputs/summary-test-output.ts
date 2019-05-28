import chalk from 'chalk';
import {TestsAnalyzer} from './tests-analyzer';
import {ReportModel} from '../models/outputs/report-model';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';

export type SummaryOptions = {
    maxLevel: number,
    level: number,
    tabulationPerLevel: number,
    summarySpacing: number
};

export class SummaryTestOutput {
    private readonly report: ReportModel;
    private readonly options: SummaryOptions = {
        level: 0,
        maxLevel: 100,
        tabulationPerLevel: 6,
        summarySpacing: 90
    };

    public constructor(report: RequisitionModel, options?: any) {
        this.report = report;
        if (options && options.level !== undefined) {
            this.options.level = options.level;
        } else if (report.level) {
            this.options.level = report.level;
        }
        this.options = Object.assign({}, this.options, options);
    }

    public print(): void {
        if (this.options.maxLevel === undefined || this.options.level <= this.options.maxLevel) {
            this.printChildren();
            this.printSelf();
        }
    }

    private printChildren() {
        const reportLeaves = (this.report.subscriptions || [])
            .concat(this.report.publishers || []);
        for (const leaf of reportLeaves) {
            const options = Object.assign({}, this.options, {
                level: this.options.level + 1,
            });
            new SummaryTestOutput(leaf, options).print();
        }
    }

    private printSelf() {
        const testAnalyzer = new TestsAnalyzer().addTest(this.report);
        console.log(this.formatTitle(testAnalyzer) + this.createSummary(testAnalyzer));
        this.printFailingTests(this.report, []);
    }

    private formatTitle(testAnalyzer: TestsAnalyzer): string {
        const initialTabulation = this.createEmptyStringSized(2 * this.options.tabulationPerLevel);
        const tagTitleSeparation = this.createEmptyStringSized(this.options.level * this.options.tabulationPerLevel);
        const titleSizeSeparation: number = initialTabulation.length + 6 + tagTitleSeparation.length + this.report.name.length;
        let formattedString = initialTabulation;
        let nameColorFunction;
        if (testAnalyzer.getTests().length === 0) {
            formattedString += `${chalk.black.bgHex('#999999')('[NULL]')} `;
            nameColorFunction = chalk.hex('#999999');
        } else if (this.report.ignored || testAnalyzer.getIgnoredList().length === testAnalyzer.getTests().length) {
            formattedString += `${chalk.black.bgYellow('[SKIP]')} `;
            nameColorFunction = chalk.yellow;
        } else if (this.report.valid) {
            formattedString += `${chalk.black.bgGreen('[PASS]')} `;
            nameColorFunction = chalk.green;
        } else {
            formattedString += `${chalk.black.bgRed('[FAIL]')} `;
            nameColorFunction = chalk.red;
        }
        formattedString += tagTitleSeparation;
        formattedString += nameColorFunction(this.report.name);
        formattedString += this.createEmptyStringSized(this.options.summarySpacing - titleSizeSeparation);
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
        const testsNumber = testAnalyzer.getNotIgnoredTests().length;
        let message = `${testAnalyzer.getPassingTests().length} tests passing of ${testsNumber} (${percentage}%)`;
        const ignoredTests = testAnalyzer.getIgnoredList();
        if (ignoredTests.length > 0) {
            message += chalk.yellow(` - ${ignoredTests.length} ignored -`);
        }
        if (this.report.time) {
            const totalTime = this.report.time.totalTime;
            message += ` ran in ${totalTime}ms`;
        }
        return this.getColor(percentage)(message);
    }

    private printFailingTests(report: ReportModel, hierarchy: string[]) {
        if (!report.ignored && !report.valid) {
            (report.tests || [])
                .filter((test: TestModel) => !test.ignored && !test.valid)
                .forEach((test: TestModel) => {
                    const initialTabulation = this.createEmptyStringSized((this.options.level + 4) * this.options.tabulationPerLevel);
                    const hierarchyTitle = initialTabulation + this.prettifyTestHierarchyMessage(hierarchy, test.name, chalk.red);
                    console.log(hierarchyTitle);
                    const description = `${initialTabulation}${this.createEmptyStringSized(2 * this.options.tabulationPerLevel)}${test.description}`;
                    console.log(chalk.red(description));
                });

            (report.subscriptions || [])
                .concat(report.publishers || [])
                .concat(report.requisitions || [])
                .forEach(((leaf: ReportModel) => this.printFailingTests(leaf, hierarchy.concat(leaf.name))));

        }
    }

    private getColor(percentage: number): Function {
        if (percentage == 100) {
            return chalk.green;
        } else if (percentage > 50) {
            return chalk.yellow;
        }
        return chalk.red;
    }

    private prettifyTestHierarchyMessage(hierarchy: string[], name: string, color: Function): string {
        const reducer = (result: string, level: string) => result + color(level) + chalk.gray(' › ');
        return hierarchy
            .reduce(reducer, '') + chalk.reset(name);
    }

}

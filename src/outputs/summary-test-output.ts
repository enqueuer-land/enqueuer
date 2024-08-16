import { TestsAnalyzer } from './tests-analyzer';
import { TestModel, testModelIsFailing, testModelIsPassing } from '../models/outputs/test-model';
import { RequisitionModel } from '../models/outputs/requisition-model';
import { PublisherModel } from '../models/outputs/publisher-model';
import { SubscriptionModel } from '../models/outputs/subscription-model';
import { ReportModel } from '../models/outputs/report-model';
import { HookModel } from '../models/outputs/hook-model';
import cgalk from 'chalk';
import { Configuration } from '../configurations/configuration';
import chalk from 'chalk';

export type SummaryOptions = {
    maxLevel: number,
    level: number,
    tabulationPerLevel: number,
    summarySpacing: number,
    showPassingTests: boolean
    printChildren: boolean,
};

export class SummaryTestOutput {
    private readonly report: ReportModel;
    private readonly options: SummaryOptions = {
        level: 0,
        maxLevel: 100,
        tabulationPerLevel: 6,
        summarySpacing: 90,
        showPassingTests: false,
        printChildren: true
    };

    public constructor(report: ReportModel, options?: any) {
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
            this.printSelf();
            if (this.options.printChildren) {
                this.printChildren();
            }
        }
    }

    private printChildren(): void {
        const reportLeaves = (this.report.subscriptions || [])
            .concat(this.report.publishers || [])
            .concat(this.buildLeavesFromHooks() || [])
            .concat(this.buildLeavesFromAssertion());
        for (const leaf of reportLeaves) {
            const options = Object.assign({}, this.options,
                {
                    level: this.options.level + 1,
                });
            new SummaryTestOutput(leaf, options).print();
        }
    }

    private buildLeavesFromHooks() {
        return Object.keys(this.report.hooks || {}).reduce((acc, key) => {
            const leaf: any = {
                ...this.report.hooks![key],
                name: key,
            };
            return acc.concat(leaf);
        }, []);
    }

    private buildLeavesFromAssertion() {
        const reduce = (this.report.tests || []).reduce((acc: ReportModel[], test: TestModel) => {
            const leaf: any = {
                ...test,
                isAssertion: true
            };
            return acc.concat(leaf);
        }, []);
        return reduce;
    }

    private printSelf() {
        const testAnalyzer = new TestsAnalyzer().addTest(this.report);
        console.log(this.formatTitle(testAnalyzer) + this.createSummary(testAnalyzer));
        this.printFailingTests(this.report as any, []);
    }

    private formatTitle(testAnalyzer: TestsAnalyzer): string {
        const initialTabulation = this.createEmptyStringSized(2 * this.options.tabulationPerLevel);
        const tagTitleSeparation = this.createEmptyStringSized(this.options.level * this.options.tabulationPerLevel);
        const titleSizeSeparation: number = initialTabulation.length + 6 + tagTitleSeparation.length + this.report.name.length;
        let formattedString = initialTabulation;
        let nameColorFunction: any;
        if (testAnalyzer.getTests().length === 0 && !this.report.isAssertion) {
            formattedString += `${chalk.black.bgHex('#999999')('[NULL]')} `;
            nameColorFunction = chalk.hex('#999999');
        } else if (this.report.ignored || (testAnalyzer.getIgnoredList().length === testAnalyzer.getTests().length && !this.report.isAssertion)) {
            formattedString += `${chalk.black.bgYellow('[SKIP]')} `;
            nameColorFunction = chalk.yellow;
        } else if (testAnalyzer.getFailingTests().length > 0 || !testModelIsPassing(this.report)) {
            formattedString += `${chalk.black.bgRed('[FAIL]')} `;
            nameColorFunction = chalk.red;
        } else { //if (this.report.valid)
            formattedString += `${chalk.black.bgGreen('[PASS]')} `;
            nameColorFunction = chalk.green;
        }
        formattedString += tagTitleSeparation;
        const iterationCounter: string = (this.report.totalIterations > 1) ? ` [${this.report.iteration}]` : '';
        formattedString += nameColorFunction(this.report.name + iterationCounter);
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
        if (this.report.isAssertion) {
            return '';
        }
        const percentage = testAnalyzer.getPercentage();
        const testsNumber = testAnalyzer.getNotIgnoredTests().length;
        let message = `${testAnalyzer.getPassingTests().length}\t tests passing of ${testsNumber}\t (${percentage}%)`;
        if (this.report.time) {
            const totalTime = this.report.time.totalTime;
            message += `\t| executed in ${totalTime}ms`;
        }
        if (Configuration.getInstance().getShowExplicitTestsOnly()) {
            message += `\t| (${testAnalyzer.getPassingTests().filter(test => !test.implicit).length}/${testAnalyzer
                .getNotIgnoredTests().filter(test => !test.implicit).length} of explicitly declared)`;
        }
        const ignoredTests = testAnalyzer.getIgnoredList();
        if (ignoredTests.length > 0) {
            message += chalk.yellow(`\t| ${ignoredTests.length} tests ignored`);
        }
        return this.getColor(percentage)(message);
    }

    private printFailingTests(report: ReportModel, hierarchy: string[]) {
        const failing = testModelIsFailing(report);
        if (failing || this.options.showPassingTests) {
            Object.keys(report.hooks || {})
                .forEach((key: string) => this.printHookTests(report.hooks![key], key, hierarchy));

            (report.subscriptions || [])
                .concat(report.publishers || [])
                .concat(report.requisitions || [])
                .forEach(((leaf: RequisitionModel | PublisherModel | SubscriptionModel) => {
                    const iterationCounter: string = (leaf.totalIterations > 1) ? ` [${leaf.iteration}]` : '';
                    this.printFailingTests(leaf, hierarchy.concat(leaf.name + iterationCounter));
                }));

        }
    }

    private printHookTests(hook: HookModel, hookName: string, hierarchy: string[]) {
        hook.tests
            .filter((test: TestModel) => !testModelIsPassing(test) || this.options.showPassingTests)
            .forEach((test: TestModel, index: number) => {
                const initialTabulation = this.createEmptyStringSized((this.options.level + 4) * this.options.tabulationPerLevel);
                let color: any;
                if (test.ignored) {
                    color = chalk.yellow;
                } else if (test.valid) {
                    color = chalk.green;
                } else {
                    color = chalk.red;
                }
                if (index === 0) {
                    const hierarchyMessage = initialTabulation + hierarchy
                        .map(level => color(level) + chalk.gray(' › '))
                        .concat(hookName)
                        .join('');
                    console.log(hierarchyMessage);
                }
                console.log(color(`${initialTabulation}${this.createEmptyStringSized(this.options.tabulationPerLevel)}${test.name}`));
                console.log(chalk.reset(`${initialTabulation}${this
                    .createEmptyStringSized(2 * this.options.tabulationPerLevel)}${test.description}\n`));
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

}

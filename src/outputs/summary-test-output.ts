import {TestsAnalyzer} from './tests-analyzer';
import {TestModel, testModelIsPassing} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {PublisherModel} from '../models/outputs/publisher-model';
import {SubscriptionModel} from '../models/outputs/subscription-model';
import {ReportModel} from '../models/outputs/report-model';
import {HookModel} from '../models/outputs/hook-model';
import colorizer from './colorizer';

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
            formattedString += `${colorizer.black.bgHex('#999999')('[NULL]')} `;
            nameColorFunction = colorizer.hex('#999999');
        } else if (this.report.ignored || (testAnalyzer.getIgnoredList().length === testAnalyzer.getTests().length && !this.report.isAssertion)) {
            formattedString += `${colorizer.black.bgYellow('[SKIP]')} `;
            nameColorFunction = colorizer.yellow;
        } else if (testAnalyzer.getFailingTests().length > 0 || !testModelIsPassing(this.report)) {
            formattedString += `${colorizer.black.bgRed('[FAIL]')} `;
            nameColorFunction = colorizer.red;
        } else { //if (this.report.valid)
            formattedString += `${colorizer.black.bgGreen('[PASS]')} `;
            nameColorFunction = colorizer.green;
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
        let message = `${testAnalyzer.getPassingTests().length} tests passing of ${testsNumber} (${percentage}%)`;
        const ignoredTests = testAnalyzer.getIgnoredList();
        if (ignoredTests.length > 0) {
            message += colorizer.yellow(` - ${ignoredTests.length} ignored -`);
        }
        if (this.report.time) {
            const totalTime = this.report.time.totalTime;
            message += ` ran in ${totalTime}ms`;
        }
        return this.getColor(percentage)(message);
    }

    private printFailingTests(report: ReportModel, hierarchy: string[]) {
        const failing = !testModelIsPassing(report);
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
                    color = colorizer.yellow;
                } else if (test.valid) {
                    color = colorizer.green;
                } else {
                    color = colorizer.red;
                }
                if (index === 0) {
                    const hierarchyMessage = initialTabulation + hierarchy
                        .map(level => color(level) + colorizer.gray(' › '))
                        .concat(hookName)
                        .join('');
                    console.log(hierarchyMessage);
                }
                console.log(color(`${initialTabulation}${this.createEmptyStringSized(this.options.tabulationPerLevel)}${test.name}`));
                console.log(colorizer.reset(`${initialTabulation}${this
                    .createEmptyStringSized(2 * this.options.tabulationPerLevel)}${test.description}\n`));
            });
    }

    private getColor(percentage: number): Function {
        if (percentage == 100) {
            return colorizer.green;
        } else if (percentage > 50) {
            return colorizer.yellow;
        }
        return colorizer.red;
    }

}

import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';
import {ReportModel} from '../models/outputs/report-model';

export interface AnalyzedTest extends TestModel {
    parent?: ReportModel;
}

export class TestsAnalyzer {
    private tests: AnalyzedTest[] = [];

    public addTest(report: ReportModel): TestsAnalyzer {
        this.findRequisitions(report);
        return this;
    }

    public isValid(): boolean {
        return this.getNotIgnoredTests().every(test => test.valid);
    }

    public getTests(): AnalyzedTest[] {
        return this.tests;
    }

    public getNotIgnoredTests(): AnalyzedTest[] {
        return this.tests.filter(test => test.ignored === false || test.ignored === undefined);
    }

    public getIgnoredList(): AnalyzedTest[] {
        return this.tests.filter(test => test.ignored !== false && test.ignored !== undefined);
    }

    public getPassingTests(): AnalyzedTest[] {
        return this.tests.filter(test => test.valid && !test.ignored);
    }

    public getFailingTests(): AnalyzedTest[] {
        return this.tests.filter(test => !test.valid && !test.ignored);
    }

    public getPercentage(): number {
        let percentage = Math.trunc(10000 * this.getPassingTests().length / this.getNotIgnoredTests().length) / 100;
        if (isNaN(percentage)) {
            percentage = 100;
        }
        return percentage;
    }

    private findRequisitions(requisition: ReportModel, parent?: ReportModel) {
        this.findTests(requisition, parent);
        (requisition.requisitions || []).forEach((child: RequisitionModel) => {
            this.findRequisitions(child, requisition);
        });
    }

    private findTests(requisition: ReportModel, parent?: ReportModel) {
        this.computeTests(requisition, parent);
        for (const child of (requisition.subscriptions || []).concat(requisition.publishers || [])) {
            this.computeTests(child, requisition);
        }
    }

    private computeTests(reportModel: ReportModel, parent?: ReportModel): void {
        if (reportModel.ignored) {
            this.tests.push({
                ignored: true,
                description: 'Ignored',
                valid: true,
                name: reportModel.name,
                parent: parent
            });
        } else {
            (reportModel.tests || []).forEach(test => {
                this.tests.push({
                    ...test,
                    parent: reportModel
                });
            });
        }
    }

}

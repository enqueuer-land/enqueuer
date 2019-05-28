import {RequisitionModel} from '../models/outputs/requisition-model';
import {ReportModel} from '../models/outputs/report-model';
import {TestModel} from '../models/outputs/test-model';

export class TestsAnalyzer {
    private tests: TestModel[] = [];

    public addTest(report: ReportModel): TestsAnalyzer {
        this.findRequisitions(report);
        return this;
    }

    public isValid(): boolean {
        return this.getNotIgnoredTests().every(test => test.valid);
    }

    public getTests(): TestModel[] {
        return this.tests;
    }

    public getNotIgnoredTests(): TestModel[] {
        return this.tests.filter(test => test.ignored === false || test.ignored === undefined);
    }

    public getIgnoredList(): TestModel[] {
        return this.tests.filter(test => test.ignored !== false && test.ignored !== undefined);
    }

    public getPassingTests(): TestModel[] {
        return this.tests.filter(test => test.valid && !test.ignored);
    }

    public getFailingTests(): TestModel[] {
        return this.tests.filter(test => !test.valid && !test.ignored);
    }

    public getPercentage(): number {
        let percentage = Math.trunc(10000 * this.getPassingTests().length / this.getNotIgnoredTests().length) / 100;
        if (isNaN(percentage)) {
            percentage = 100;
        }
        return percentage;
    }

    private findRequisitions(requisition: ReportModel) {
        this.findTests(requisition);
        (requisition.requisitions || []).forEach((child: RequisitionModel) => {
            this.findRequisitions(child);
        });
    }

    private findTests(requisition: ReportModel) {
        this.computeTests(requisition);
        for (const child of (requisition.subscriptions || []).concat(requisition.publishers || [])) {
            this.computeTests(child);
        }
    }

    private computeTests(reportModel: ReportModel): void {
        if (reportModel.ignored) {
            this.tests.push({
                ...reportModel,
                description: reportModel.description || 'Ignored'
            });
        } else {
            (reportModel.tests || []).forEach(test => {
                this.tests.push(test);
            });
        }
    }

}

import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';
import {ReportModel} from '../models/outputs/report-model';

export interface AnalyzedTest extends TestModel {
    hierarchy: string[];
}

export class TestsAnalyzer {
    private tests: AnalyzedTest[] = [];

    public addTest(report: ReportModel): TestsAnalyzer {
        this.findRequisitions([report], []);
        return this;
    }

    public isValid(): boolean {
        return this.getNotIgnoredTests().every(test => test.valid);
    }

    public getTests(): AnalyzedTest[] {
        return this.tests;
    }

    public getNotIgnoredTests(): AnalyzedTest[] {
        return this.tests.filter(test => !test.ignored);
    }

    public getIgnoredList(): AnalyzedTest[] {
        return this.tests.filter(test => test.ignored);
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

    private findRequisitions(requisition: ReportModel[] = [], hierarchy: string[]) {
        requisition.forEach((child: any) => {
            this.findRequisitions(child.requisitions, hierarchy.concat(child.name));
            this.findTests(child, hierarchy.concat(child.name));
        });
    }

    private findTests(requisition: RequisitionModel, hierarchy: string[]) {
        this.computeTests(requisition, hierarchy);
        for (const child of (requisition.subscriptions || []).concat(requisition.publishers || [])) {
            const childHierarchy = hierarchy.concat(child.name);
            this.computeTests(child, childHierarchy);
        }
    }

    private computeTests(reportModel: ReportModel, hierarchy: string[]): void {
        if (reportModel.ignored) {
            this.tests.push({
                ignored: true,
                description: 'Ignored',
                valid: true,
                name: reportModel.name,
                hierarchy: hierarchy
            });
        } else {
            (reportModel.tests || []).forEach(test => {
                this.tests.push({
                    ...test,
                    hierarchy: hierarchy
                });
            });
        }
    }

}

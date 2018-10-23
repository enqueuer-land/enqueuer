import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';

export type Test = { test: TestModel, hierarchy: string[] };

export class TestsAnalyzer {
    private tests: Test[] = [];

    public constructor(report?: RequisitionModel) {
        if (report) {
            this.addTest(report);
        }
    }

    public addTest(report: RequisitionModel) {
        this.findRequisitions([report], []);
    }

    public getTests(): any[] {
        return this.tests;
    }

    public getPassingTests(): Test[] {
        return this.tests.filter(test => test.test.valid);
    }

    public getFailingTests(): any[] {
        return this.tests.filter(test => !test.test.valid);
    }

    public getPercentage(): number {
        let percentage = Math.trunc(10000 * this.getPassingTests().length / this.getTests().length) / 100;
        if (isNaN(percentage)) {
            percentage = 100;
        }
        return percentage;
    }

    private findRequisitions(requisition: RequisitionModel[] = [], hierarchy: string[]) {
        requisition.forEach((requisition: any) => {
            this.findRequisitions(requisition.requisitions, hierarchy.concat(requisition.name));
            this.findTests(requisition, hierarchy.concat(requisition.name));
        });
    }

    private findTests(requisition: RequisitionModel, hierarchy: string[]) {
        this.sumTests(requisition.tests, hierarchy.concat(requisition.name));

        (requisition.subscriptions || [])
            .forEach((subscription: any) => this.sumTests(subscription.tests, hierarchy.concat(subscription.name)));
        (requisition.publishers || [])
            .forEach((publisher: any) => this.sumTests(publisher.tests, hierarchy.concat(publisher.name)));
    }

    private sumTests(tests: any[], hierarchy: string[]): void {
        tests.forEach(test => this.tests.push({test, hierarchy: hierarchy}));
    }

}

import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';

export type Test = { test: TestModel, hierarchy: string[] };
export type IgnoredItem = { hierarchy: string[] };

export class TestsAnalyzer {
    private tests: Test[] = [];
    private ignoredList: IgnoredItem[] = [];

    public constructor(report?: RequisitionModel) {
        if (report) {
            this.addTest(report);
        }
    }

    public addTest(report: RequisitionModel) {
        this.findRequisitions([report], []);
    }

    public getTests(): Test[] {
        return this.tests;
    }

    public getIgnoredList(): IgnoredItem[] {
        return this.ignoredList;
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
        if (requisition.ignored) {
            this.computeIgnored(hierarchy.concat(requisition.name));
        } else {
            this.computeTests(requisition.tests, hierarchy.concat(requisition.name));
            for (const child of (requisition.subscriptions || []).concat(requisition.publishers || [])) {
                const childHierarchy = hierarchy.concat(child.name);
                if (child.ignored) {
                    this.computeIgnored(childHierarchy);
                } else {
                    this.computeTests(child.tests, childHierarchy);
                }
            }
        }

    }

    private computeTests(tests: any[], hierarchy: string[]): void {
        tests.forEach(test => this.tests.push({test, hierarchy: hierarchy}));
    }

    private computeIgnored(hierarchy: string[]): void {
        this.ignoredList.push({hierarchy: hierarchy});
    }

}

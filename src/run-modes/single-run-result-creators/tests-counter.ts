import {RequisitionModel} from '../../models/outputs/requisition-model';
import {TestModel} from '../../models/outputs/test-model';

export class TestsCounter {
    private totalTests: number = 0;
    private failingTests: number = 0;

    public addRequisitionTest(report: RequisitionModel): void {
        this.findRequisitions([report]);
    }

    public addTest(test: TestModel): void {
        this.sumTests([test]);
    }

    public getTestsNumber() {
        return this.totalTests;
    }

    public getFailingTestsNumber() {
        return this.failingTests;
    }

    public getPercentage(): number {
        let percentage = Math.trunc(10000 * (this.totalTests - this.failingTests) / this.totalTests) / 100;
        if (isNaN(percentage)) {
            percentage = 100;
        }
        return percentage;
    }

    private findRequisitions(reports: RequisitionModel[] = []) {
        reports.forEach((requisition: RequisitionModel) => {
            this.findRequisitions(requisition.requisitions);
            this.findTests(requisition);
        });
    }

    private findTests(requisition: RequisitionModel) {
        this.sumTests(requisition.tests);
        if (requisition.subscriptions) {
            requisition.subscriptions
                .forEach(subscription => this.sumTests(subscription.tests));
        }
        if (requisition.publishers) {
            requisition.publishers
                .forEach(publisher => this.sumTests(publisher.tests));
        }
    }

    private sumTests(tests: TestModel[]): void {
        this.failingTests += tests.filter(test => !test.valid).length;
        this.totalTests += tests.length;
    }

}
import {ResultModel} from '../models/outputs/result-model';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';

//TODO test it
export class TestsCounter {
    private totalTests: number = 0;
    private failingTests: number = 0;

    public addTests(report: ResultModel): void {
        this.findRequisitions(report);
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
            percentage = 0;
        }
        return percentage;
    }

    private findRequisitions(resultModel: ResultModel) {
        resultModel.runnables.forEach((runnable: ResultModel | RequisitionModel) => {
            if (runnable.type == 'runnable') {
                this.findRequisitions(runnable as ResultModel);
            } else if (runnable.type == 'requisition') {
                const requisition = runnable as RequisitionModel;
                this.findTests(requisition);
            }
        });
    }

    private findTests(requisition: RequisitionModel) {
        this.sumTests(requisition.tests);
        requisition.subscriptions
            .forEach(subscription => this.sumTests(subscription.tests));
        const startEvent = this.detectStartEvent(requisition);
        if (startEvent) {
            this.sumTests(startEvent.tests);
        }
    }

    private sumTests(tests: TestModel[]): void {
        this.failingTests += tests.filter(test => !test.valid).length;
        this.totalTests += tests.length;
    }

    private detectStartEvent(requisition: RequisitionModel): any {
        if (requisition.startEvent.subscription) {
            return requisition.startEvent.subscription;
        } else if (requisition.startEvent.publisher) {
            return requisition.startEvent.publisher;
        }
    }
}
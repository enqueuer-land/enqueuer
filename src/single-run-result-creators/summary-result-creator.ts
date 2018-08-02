import {ResultModel} from '../models/outputs/result-model';
import {ResultCreator} from './result-creator';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';

export class SummaryResultCreator extends ResultCreator {
    private testCounter: number = 0;
    private failedTestNames: string[] = [];

    public constructor() {
        super();
    }
    public addTestSuite(suite: ResultModel): void {
        this.findRequisitions(suite, '');
    }

    public addError(err: any): void {
        ++this.testCounter;
        this.failedTestNames.push(this.addLevel('', err.toString()));
    }

    public isValid(): boolean {
        return this.failedTestNames.length == 0;
    }

    public create(): void {
        console.log(`Tests summary ${this.testCounter - this.failedTestNames.length}/${this.testCounter} => ` +
                    `${Math.trunc(10000 * (this.testCounter - this.failedTestNames.length) / this.testCounter) / 100}% passing`);
        if (this.failedTestNames.length > 0) {
            console.log(`Failing tests:`);
            this.failedTestNames
                .forEach((failingTest) => {
                    console.log(`\t${failingTest}`);
                });
        }
    }

    private findRequisitions(resultModel: ResultModel, prefix: string) {
        resultModel.runnables.forEach((runnable: ResultModel | RequisitionModel) => {
            const levelName = this.addLevel(prefix, resultModel.name);
            if (runnable.type == 'runnable') {
                this.findRequisitions(runnable, levelName);
            } else if (runnable.type == 'requisition') {
                const requisition = runnable as RequisitionModel;
                this.findTests(requisition, this.addLevel(levelName, requisition.name));
            }
        });
    }

    private findTests(requisition: RequisitionModel, prefix: string) {
        this.inspectInvalidTests(requisition.tests, prefix);
        requisition.subscriptions.forEach(subscription =>
                                        this.inspectInvalidTests(subscription.tests, this.addLevel(prefix, subscription.name)));
        if (requisition.startEvent.subscription) {
            this.inspectInvalidTests(requisition.startEvent.subscription.tests, this.addLevel(prefix, requisition.startEvent.subscription.name));
        }
        if (requisition.startEvent.publisher) {
            this.inspectInvalidTests(requisition.startEvent.publisher.tests, this.addLevel(prefix, requisition.startEvent.publisher.name));
        }
    }

    private inspectInvalidTests(tests: TestModel, prefix: string) {
        this.testCounter += Object.keys(tests).length;
        Object.keys(tests)
            .forEach((key: string) => {
                if (!tests[key]) {
                    this.failedTestNames.push(this.addLevel(prefix, key));
                }
            });
    }

    private addLevel(prefix: string, newLevelName: string) {
        return prefix.concat(' -> ').concat(newLevelName);
    }

}
import {ResultModel} from '../models/outputs/result-model';
import {Injectable} from 'conditional-injector';
import {ResultCreator} from './result-creator';
import prettyjson from 'prettyjson';
import {TestModel} from '../models/outputs/test-model';
import {RequisitionModel} from '../models/outputs/requisition-model';

const options = {
    defaultIndentation: 4,
    keysColor: 'white',
    dashColor: 'grey',
    inlineArrays: true
};

@Injectable()
export class StandardOutputResultCreator extends ResultCreator {
    private report: any;
    private testCounter: number = 0;
    private failedTestNames: string[] = [];

    public constructor() {
        super();
        this.report = {
            name: '',
            tests: {},
            valid: true,
            runnables: {}
        };

    }
    public addTestSuite(suite: ResultModel): void {
        this.report.runnables[suite.name] = suite;
        this.report.valid = this.report.valid && suite.valid;
        this.findRequisitions(suite, this.report.name);
    }
    public addError(err: any): void {
        ++this.testCounter;
        this.failedTestNames.push(this.addLevel(this.report.name, err.toString()));
        this.report.valid = false;
    }

    public isValid(): boolean {
        return this.report.valid;
    }

    public create(): void {
        console.log(prettyjson.render(this.report, options));
        console.log(`Tests summary (${this.testCounter - this.failedTestNames.length}/${this.testCounter})`);
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
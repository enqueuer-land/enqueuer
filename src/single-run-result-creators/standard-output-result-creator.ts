import {ResultModel} from '../models/outputs/result-model';
import {Injectable, Scope} from 'conditional-injector';
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

@Injectable({scope: Scope.Application})
export class StandardOutputResultCreator extends ResultCreator {
    private report: any;

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
    }
    public addError(err: any): void {
        this.report.valid = false;
    }

    public isValid(): boolean {
        return this.report.valid;
    }

    public create(): void {
        console.log(prettyjson.render(this.report, options));
    }

}
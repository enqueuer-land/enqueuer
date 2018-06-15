import {ResultModel} from '../models/outputs/result-model';
import {Injectable} from 'conditional-injector';
import {ResultCreator} from './result-creator';
import {SingleRunResultModel} from '../models/outputs/single-run-result-model';
import prettyjson from 'prettyjson';

const options = {
    defaultIndentation: 4,
    keysColor: 'white',
    dashColor: 'grey',
    inlineArrays: true
};

@Injectable()
export class StandardOutputResultCreator extends ResultCreator {
    private report: SingleRunResultModel;

    public constructor() {
        super();
        this.report = {
            name: 'standardOutput',
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
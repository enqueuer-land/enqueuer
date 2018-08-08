import {ResultModel} from '../models/outputs/result-model';
import {ResultCreator} from './result-creator';
import {SummaryResultCreator} from './summary-result-creator';
import {Logger} from '../loggers/logger';
import {FileResultCreator} from './file-result-creator';

export class MultiResultCreator extends ResultCreator {
    private resultCreators: ResultCreator[] = [];

    public constructor(reportName?: string) {
        super();
        if (reportName) {
            this.resultCreators.push(new FileResultCreator(reportName));
        }
        this.resultCreators.push(new SummaryResultCreator());
    }

    public addTestSuite(name: string, report: ResultModel): void {
        Logger.trace('Adding test suite');
        this.resultCreators.forEach(result => result.addTestSuite(name, report));
    }

    public addError(err: any): void {
        this.resultCreators.forEach(result => result.addError(err));
    }

    public isValid(): boolean {
        return this.resultCreators.every(result => result.isValid());
    }

    public create(): void {
        this.resultCreators.forEach(result => result.create());
    }
}
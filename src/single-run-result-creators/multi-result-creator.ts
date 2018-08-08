import {ResultModel} from '../models/outputs/result-model';
import {ResultCreator} from './result-creator';
import {Container} from 'conditional-injector';
import {SummaryResultCreator} from './summary-result-creator';

export class MultiResultCreator extends ResultCreator {
    private resultCreators: ResultCreator[] = [];

    public constructor(reports: string[]) {
        super();
        if (reports && reports.length > 0) {
            reports.forEach(report => {
                this.resultCreators.push(Container.subclassesOf(ResultCreator).create(report));
            });
        }
        this.resultCreators.push(new SummaryResultCreator());
    }

    public addTestSuite(suite: ResultModel): void {
        this.resultCreators.forEach(result => result.addTestSuite(suite));
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
import {ResultModel} from '../models/outputs/result-model';
import {ResultCreator} from './result-creator';
import {Container} from 'conditional-injector';

export class MultiResultCreator extends ResultCreator {
    private resultCreators: ResultCreator[] = [];

    public constructor(reports: string[]) {
        super();
        reports.forEach(report => {
            this.resultCreators.push(Container.subclassesOf(ResultCreator).create(report));
        });
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
import {ResultCreator} from './result-creator';
import {ConsoleResultCreator} from './console-result-creator';
import {Logger} from '../loggers/logger';
import {FileResultCreator} from './file-result-creator';
import {RequisitionModel} from '../models/outputs/requisition-model';

export class MultiResultCreator implements ResultCreator {
    private resultCreators: ResultCreator[] = [];

    public constructor(reportName?: string) {
        if (reportName) {
            this.resultCreators.push(new FileResultCreator(reportName));
        }
        this.resultCreators.push(new ConsoleResultCreator());
    }

    public addTestSuite(name: string, report: RequisitionModel): void {
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
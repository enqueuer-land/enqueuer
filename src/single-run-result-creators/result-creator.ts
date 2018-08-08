import {ResultModel} from '../models/outputs/result-model';

export abstract class ResultCreator {
    public abstract addTestSuite(name: string, report: ResultModel): void;
    public abstract addError(err: any): void;
    public abstract isValid(): boolean;
    public abstract create(): void;
}
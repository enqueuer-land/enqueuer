import {ResultModel} from '../models/outputs/result-model';

export interface ResultCreator {
    addTestSuite(name: string, report: ResultModel): void;
    addError(err: any): void;
    isValid(): boolean;
    create(): void;
}
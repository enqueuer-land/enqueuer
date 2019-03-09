import {TestModel} from './test-model';

export interface ReportModel {
    [indexSignature: string]: any;
    name: string;
    valid: boolean;
    ignored?: boolean;
    tests: TestModel[];
}

export function checkValidation(reportModel: ReportModel): boolean {
    return reportModel.tests.every((test) => test.valid);
}

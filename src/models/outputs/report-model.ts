import { TestModel } from './test-model';

export interface ReportModel {
    name: string;
    valid: boolean;
    tests: TestModel[];
}

export function checkValidation(reportModel: ReportModel): boolean {
    return reportModel.tests.filter((test) => !test.valid).length == 0;
}
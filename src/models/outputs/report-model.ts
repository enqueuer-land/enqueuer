import { TestModel } from './test-model';

export interface ReportModel {
    name: string;
    valid: boolean;
    tests: TestModel;
}

export function checkValidation(reportModel: ReportModel): boolean {
    return Object.keys(reportModel.tests).filter((key: string) => !reportModel.tests[key]).length == 0;
}


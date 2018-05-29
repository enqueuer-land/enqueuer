import { TestModel } from './test-model';

export interface ReportModel {
    name: string;
    valid: boolean;
    tests: TestModel;
}

export function checkValidation(reportModel: ReportModel): boolean {
    const length2 = Object.keys(reportModel.tests).filter((key: string) => !reportModel.tests[key]).length;
    console.log(length2)
    return length2 == 0;
}


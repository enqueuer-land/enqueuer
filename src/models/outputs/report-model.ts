import {TestModel, testModelIsPassing} from './test-model';

export interface ReportModel {
    [indexSignature: string]: any;

    name: string;
    valid: boolean;
    ignored?: boolean;
    tests: TestModel[];
}

export function reportModelIsPassing(reportModel: ReportModel): boolean {
    return testModelIsPassing(reportModel) && (reportModel.tests || []).every((test) => testModelIsPassing(test));
}

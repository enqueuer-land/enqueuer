import {RequisitionModel} from '../../models/outputs/requisition-model';

export interface ResultCreator {
    addTestSuite(name: string, report: RequisitionModel): void;
    addError(err: any): void;
    isValid(): boolean;
    create(): void;
}
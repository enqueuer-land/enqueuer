import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionValidator} from './requisition-validator';

export class RequisitionParser {
    public parse(value: string): RequisitionModel {
        const parsed: any = DynamicModulesManager.getInstance().getObjectParserManager().tryToParseWithParsers(value, ['yml', 'json']);

        const requisition = Array.isArray(parsed) ? {requisitions: parsed} : parsed;
        const requisitionValidator = new RequisitionValidator();
        if (!requisitionValidator.validate(requisition)) {
            throw "'" + value + "' is not a valid requisition. " + requisitionValidator.getErrorMessage();
        }
        return requisition;
    }
}

import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionValidator} from './requisition-validator';

export class RequisitionParser {

    public parse(content: string): RequisitionModel {
        let fileContent: any = DynamicModulesManager
            .getInstance().getObjectParserManager()
            .tryToParseWithParsers(content, ['yml', 'json']);

        const requisition = Array.isArray(fileContent) ? {requisitions: fileContent} : fileContent;
        const requisitionValidator = new RequisitionValidator();
        if (!requisitionValidator.validate(requisition)) {
            throw '\'' + content + '\' is not a valid requisition. ' + requisitionValidator.getErrorMessage();
        }
        return requisition;
    }
}

import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionValidator} from './requisition-validator';
import * as fs from 'fs';

export class RequisitionFileParser {

    public parseFile(filename: string): RequisitionModel {
        const fileBufferContent = fs.readFileSync(filename).toString();
        let fileContent: any = DynamicModulesManager
            .getInstance().getObjectParserManager()
            .tryToParseWithParsers(fileBufferContent, ['yml', 'json']);

        const requisition = Array.isArray(fileContent) ? {requisitions: fileContent} : fileContent;
        const requisitionValidator = new RequisitionValidator();
        if (!requisitionValidator.validate(requisition)) {
            throw 'File \'' + filename + '\' is not a valid requisition. ' + requisitionValidator.getErrorMessage();
        }
        requisition.name = requisition.name || filename;
        return requisition;
    }

}

import {RequisitionModel} from '../models/inputs/requisition-model';
import * as fs from 'fs';
import {RequisitionParentCreator} from '../components/requisition-parent-creator';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';

export class RequisitionFileParser {
    private readonly filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    public parse(): RequisitionModel {
        const fileBufferContent = fs.readFileSync(this.filename).toString();
        const fileContent: any = DynamicModulesManager.getInstance().getObjectParserManager().tryToParseWithEveryParser(fileBufferContent);
        if (Array.isArray(fileContent)) {
            return new RequisitionParentCreator().create(this.filename, fileContent);
        }
        if (!fileContent.name) {
            fileContent.name = this.filename;
        }
        return fileContent;
    }

}

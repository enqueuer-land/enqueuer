import {RequisitionModel} from '../models/inputs/requisition-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';
import * as fs from 'fs';
import {RequisitionParentCreator} from './requisition-parent-creator';

export class RequisitionFileParser {
    private readonly filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    public parse(): RequisitionModel {
        const fileBufferContent = fs.readFileSync(this.filename).toString();
        const fileContent: any = new MultipleObjectNotation().parse(fileBufferContent);
        if (Array.isArray(fileContent)) {
            return new RequisitionParentCreator().create(this.filename, fileContent);
        }
        if (!fileContent.name) {
            fileContent.name = this.filename;
        }
        return fileContent;
    }

}

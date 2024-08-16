import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionParser} from './requisition-parser';
import * as fs from 'fs';

export class RequisitionFileParser {
    public parseFile(filename: string): RequisitionModel {
        const fileBufferContent = fs.readFileSync(filename).toString();
        const requisition = new RequisitionParser().parse(fileBufferContent);
        requisition.name = requisition.name || filename;
        return requisition;
    }
}

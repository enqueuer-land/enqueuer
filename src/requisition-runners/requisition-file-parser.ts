import {RequisitionModel} from '../models/inputs/requisition-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';
import * as fs from 'fs';
import * as input from '../models/inputs/requisition-model';

export class RequisitionFileParser {
    private readonly filename: string;

    constructor(filename: string) {
        this.filename = filename;
    }

    public parse(): RequisitionModel {
        const fileBufferContent = fs.readFileSync(this.filename).toString();
        let requisition: any = new MultipleObjectNotation().parse(fileBufferContent);
        if (Array.isArray(requisition)) {
            return this.createParent(requisition);
        }
        if (!requisition.name) {
            requisition.name = this.filename;
        }
        return requisition;
    }

    private createParent(requisitions: input.RequisitionModel[]): input.RequisitionModel {
        return {
            name: this.filename,
            id: this.filename,
            subscriptions: [],
            publishers: [],
            requisitions: this.addDefaultNames(requisitions)
        };
    }

    private addDefaultNames(requisitions: input.RequisitionModel[]) {
        return requisitions.map((requisition, index) => {
            if (!requisition.name) {
                requisition.name = `Requisition #${index}`;
            }
            return requisition;
        });
    }

}

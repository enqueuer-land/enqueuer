import {IdGenerator} from '../strings/id-generator';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';

export class RequisitionParser {

    public parse(message: string): RequisitionModel[] {
        let parsed: any = new MultipleObjectNotation().parse(message);
        if (!Array.isArray(parsed)) {
            parsed = [parsed];
        }
        return this.insertIds(parsed);
    }

    private insertIds(requisitions: RequisitionModel[] = []): RequisitionModel[] {
        requisitions
            .forEach(requisition => requisition.requisitions = this.insertIds(requisition.requisitions));
        requisitions
            .filter((item: RequisitionModel) => !item.id)
            .forEach((item: RequisitionModel) => item.id = new IdGenerator(item).generateId());
        return requisitions;
    }

}
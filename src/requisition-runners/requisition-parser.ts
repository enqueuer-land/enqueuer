import {RequisitionModel} from '../models/inputs/requisition-model';
import {MultipleObjectNotation} from '../object-notations/multiple-object-notation';

export class RequisitionParser {

    public parse(message: string): RequisitionModel[] {
        let parsed: any = new MultipleObjectNotation().parse(message);
        if (!Array.isArray(parsed)) {
            parsed = [parsed];
        }
        return parsed;
    }
}

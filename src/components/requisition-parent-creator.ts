import {IdGenerator} from '../strings/id-generator';
import {RequisitionModel} from '../models/inputs/requisition-model';
import * as input from '../models/inputs/requisition-model';

export class RequisitionParentCreator {

    public create(name: string, childRequisitions: RequisitionModel[] = []): RequisitionModel {
        return {
            name: name,
            id: new IdGenerator(name).generateId(),
            subscriptions: [],
            publishers: [],
            requisitions: this.addDefaultNames(childRequisitions)
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

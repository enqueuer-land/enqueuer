import {RequisitionModel} from '../models/inputs/requisition-model';

export class ComponentParentCreator {

    public createRecursively(requisitionModel: RequisitionModel): RequisitionModel {
        (requisitionModel.publishers || [])
            .concat((requisitionModel.subscriptions || []))
            .forEach(child => {
            child.parent = requisitionModel;
        });
        (requisitionModel.requisitions || [])
            .forEach(child => {
            child.parent = requisitionModel;
            this.createRecursively(child);
        });
        return requisitionModel;
    }

}

import {RequisitionModel} from '../models/inputs/requisition-model';

export class ComponentParentBackupper {
    private readonly parentMap: any = {};

    public removeParents(requisition: RequisitionModel): void {
        this.parentMap[requisition.id] = requisition.parent;
        delete requisition.parent;
        (requisition.requisitions || []).map((child) => this.removeParents(child));
        (requisition.publishers || []).concat(requisition.subscriptions || []).map((leaf) => {
            this.parentMap[leaf.id] = leaf.parent;
            delete leaf.parent;
        });
    }

    public putParentsBack(requisition: RequisitionModel): void {
        requisition.parent = this.parentMap[requisition.id];
        (requisition.requisitions || []).map((child) => this.putParentsBack(child));
        (requisition.publishers || []).concat(requisition.subscriptions || []).map((leaf) => (leaf.parent = this.parentMap[leaf.id]));
    }
}

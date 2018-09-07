import {RequisitionModel} from '../models/inputs/requisition-model';

export class RequisitionMultiplier {
    private requisition: RequisitionModel;

    public constructor (requisition: RequisitionModel) {
        this.requisition = requisition;
    }

    public multiply(): RequisitionModel[] {
        const iterations = this.requisition.iterations;

        if (this.requisition.iterations === undefined) {
            return [this.requisition];
        }

        let requisitions: RequisitionModel[] = [];
        for (let x = iterations || 0; x > 0; --x) {
            const clone: RequisitionModel = {...this.requisition} as RequisitionModel;
            clone.name = clone.name + ` [${x}]`;
            requisitions = requisitions.concat(clone);
        }
        return requisitions;
    }
}
import {RequisitionModel} from '../models/inputs/requisition-model';

//TODO test it
export class ParentRemover {

    public remove(requisition: RequisitionModel): RequisitionModel {
        return this.deepRemove(requisition) as RequisitionModel;
    }

    public deepRemove(requisition: RequisitionModel): object {
        const clone = {...requisition};
        delete clone.parent;

        Object.keys(clone).forEach(key => {
            const value = clone[key];
            if (typeof value === 'object') {
                if (Array.isArray(value)) {
                    for (let index in value) {
                        clone[key][index] = this.deepRemove(value[index]);
                    }
                } else {
                    clone[key] = this.deepRemove(value);
                }
            }
        });
        return clone;

    }
}

import {RequisitionModel} from '../models/inputs/requisition-model';

export class RequisitionValidator {
    public validate(requisition: RequisitionModel): boolean {
        if (typeof requisition !== 'object' || !requisition) {
            return false;
        }
        if (
            requisition.onInit !== undefined ||
            requisition.onFinish !== undefined ||
            requisition.import !== undefined ||
            requisition.delay !== undefined
        ) {
            return true;
        }
        if (Array.isArray(requisition.publishers) && requisition.publishers.length > 0) {
            return true;
        }
        if (Array.isArray(requisition.subscriptions) && requisition.subscriptions.length > 0) {
            return true;
        }
        if (Array.isArray(requisition.requisitions) && requisition.requisitions.length > 0) {
            return requisition.requisitions.every((child) => this.validate(child));
        }
        return false;
    }

    public getErrorMessage(): string {
        return "Unable to find: 'onInit', 'onFinish', 'delay', 'requisitions', 'publishers', 'subscriptions' nor 'import'.";
    }
}

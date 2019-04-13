import {RequisitionModel} from '../models/inputs/requisition-model';
import {RequisitionAdopter} from '../components/requisition-adopter';
import {RequisitionValidator} from './requisition-validator';
import {Logger} from '../loggers/logger';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {PublisherModel} from '../models/inputs/publisher-model';

export class ComponentImporter {

    public importRequisition(requisition: RequisitionModel): RequisitionModel {
        const importValue = requisition.import;
        if (importValue) {
            const imported: any = Array.isArray(importValue) ? {requisitions: importValue} : importValue;
            const requisitionValidator = new RequisitionValidator();
            if (!requisitionValidator.validate(imported)) {
                const message = `Error importing ${JSON.stringify(importValue)}: ${requisitionValidator.getErrorMessage()}`;
                Logger.error(message);
                throw message;
            }
            const merged = Object.assign({}, requisition, imported);
            return new RequisitionAdopter(merged).getRequisition();
        }
        return requisition;
    }

    public importSubscription(subscription: SubscriptionModel): SubscriptionModel {
        const importValue = subscription.import;
        if (importValue) {
            return Object.assign({}, subscription, importValue);
        }
        return subscription;
    }

    public importPublisher(publisherModel: PublisherModel): PublisherModel {
        const importValue = publisherModel.import;
        if (importValue) {
            return Object.assign({}, publisherModel, importValue);
        }
        return publisherModel;
    }

}

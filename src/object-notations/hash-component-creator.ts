import {RequisitionModel} from '../models/inputs/requisition-model';
import {IdGenerator} from '../strings/id-generator';
import {PublisherModel} from '../models/inputs/publisher-model';
import {SubscriptionModel} from '../models/inputs/subscription-model';

//TODO test it
export class HashComponentCreator {

    public insert(requisition: RequisitionModel): RequisitionModel {
        this.insertInComponent(requisition);
        (requisition.requisitions || []).map(child => this.insert(child));
        (requisition.publishers || []).map(publisher => this.insertInComponent(publisher));
        (requisition.subscriptions || []).map(subscription => this.insertInComponent(subscription));
        return requisition;
    }

    public refresh(requisition: RequisitionModel): RequisitionModel {
        this.refreshInComponent(requisition);
        (requisition.requisitions || []).map(child => this.refresh(child));
        (requisition.publishers || []).map(publisher => this.refreshInComponent(publisher));
        (requisition.subscriptions || []).map(subscription => this.refreshInComponent(subscription));
        return requisition;
    }

    private refreshInComponent(component: RequisitionModel | PublisherModel | SubscriptionModel) {
        component.hash = new IdGenerator(component).generateId();
    }

    private insertInComponent(component: RequisitionModel | PublisherModel | SubscriptionModel) {
        component.hash = component.hash || new IdGenerator(component).generateId();
    }
}

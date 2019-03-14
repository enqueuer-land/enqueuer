import {IdGenerator} from '../strings/id-generator';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {PublisherModel} from '../models/inputs/publisher-model';
import {SubscriptionModel} from '../models/inputs/subscription-model';

export class RequisitionAdopter {
    private readonly requisition: RequisitionModel;
    private defaultModel = {
        subscriptions: [],
        publishers: [],
        requisitions: [],
        delay: 0,
        iterations: 1,
    };

    constructor(name: string, node: any) {
        this.requisition = this.baptiseRequisition(node, name);
    }

    public getRequisition(): RequisitionModel {
        return this.requisition;
    }

    private baptiseRequisition(requisition: RequisitionModel, name: string, parent?: RequisitionModel): RequisitionModel {
        requisition = Object.assign({}, this.defaultModel, requisition, {parent}) as RequisitionModel;
        this.putNameAndId(requisition, name, parent);
        requisition.requisitions = requisition.requisitions
            .map((child, index) => this.baptiseRequisition(child, `Requisition #${index}`, requisition) as RequisitionModel);
        requisition.publishers = requisition.publishers
            .map((publisher, index) => this.putNameAndId(publisher, `Publisher #${index}`, requisition) as PublisherModel);
        requisition.subscriptions = requisition.subscriptions
            .map((subscription, index) => this.putNameAndId(subscription, `Subscription #${index}`, requisition) as SubscriptionModel);
        return requisition;
    }

    private putNameAndId(component: RequisitionModel | PublisherModel | SubscriptionModel, name: string, parent?: RequisitionModel) {
        if (!component.name) {
            component.name = name;
        }
        if (!component.id) {
            component.id = new IdGenerator(component).generateId();
        }
        component.parent = parent;
        return component;
    }

}

import { SubscriptionModel } from './subscription-model';
import { Finishable } from '../events/finishable';
import { Initializable } from '../events/initializable';
import { PublisherModel } from './publisher-model';

export interface RequisitionModel extends Finishable, Initializable {
    timeout: number;
    id: string;
    name: string;
    level: number;
    subscriptions: SubscriptionModel[];
    publishers: PublisherModel[];
    parent?: RequisitionModel;
    delay: number;
    iterations: number;
    ignore?: boolean;
    import?: RequisitionModel;
    requisitions: RequisitionModel[];

    [propName: string]: any;
}

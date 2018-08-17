import {RequisitionModel} from './requisition-model';

export interface RunnableModel {
    id: string;
    name: string;
    delay?: number;
    runnables: (RunnableModel | RequisitionModel)[];
}
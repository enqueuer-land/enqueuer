import {RequisitionModel} from './requisition-model';

export interface RunnableModel {
    id: string;
    name: string;
    delay?: number;
    iterations?: number;
    runnables: (RunnableModel | RequisitionModel)[];
}
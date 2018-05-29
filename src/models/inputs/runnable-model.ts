import {RequisitionModel} from './requisition-model';

export interface RunnableModel {
    id: string;
    name: string;
    runnableVersion: string;
    initialDelay?: number;
    runnables: (RunnableModel | RequisitionModel)[];
}
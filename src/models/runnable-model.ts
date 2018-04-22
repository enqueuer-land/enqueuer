import {RequisitionModel} from "./requisition-model";

export interface RunnableModel {
    id: string;
    name?: string;
    runnableVersion: string;
    runnables: (RunnableModel | RequisitionModel)[];
}
import {ResultModel} from "../models/outputs/result-model";
import {RequisitionModel} from "../models/outputs/requisition-model";

export abstract class Runner {
    public abstract run(): Promise<ResultModel | RequisitionModel>;
}
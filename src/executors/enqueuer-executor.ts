import {SingleRunResultModel} from "../models/outputs/single-run-result-model";

export abstract class EnqueuerExecutor {
    public abstract async init(): Promise<void>;
    public abstract execute(): Promise<SingleRunResultModel>;
}
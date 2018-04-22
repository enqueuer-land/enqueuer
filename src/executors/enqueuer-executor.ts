import {Report} from "../reports/report";

export abstract class EnqueuerExecutor {
    public abstract async init(): Promise<void>;
    public abstract execute(): Promise<Report>;
}
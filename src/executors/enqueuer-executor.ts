import {Report} from "../reporters/report";

export abstract class EnqueuerExecutor {
    public abstract async init(): Promise<void>;
    public abstract execute(): Promise<Report>;
}
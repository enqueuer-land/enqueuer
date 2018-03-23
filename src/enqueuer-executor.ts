import {Report} from "./reporters/report";

export abstract class EnqueuerExecutor {
    public abstract execute(): Promise<Report>;
}
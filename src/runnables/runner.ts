import {Report} from "../reports/report";

export abstract class Runner {
    public abstract run(): Promise<Report>;
}
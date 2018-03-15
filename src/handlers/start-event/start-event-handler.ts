import {Report} from "../../reporters/report";

export abstract class StartEventHandler {
    abstract start(): Promise<void>;
    abstract getReport(): Report;
}
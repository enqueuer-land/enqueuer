import {Report} from "../reporters/report";

export abstract class StartEvent {
    abstract start(): Promise<void>;
    abstract getReport(): Report;
}
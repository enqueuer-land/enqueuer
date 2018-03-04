import {Report} from "../../report/report";

export interface StartEventType {
    start(): Promise<void>;

    getReport(): Report;
}
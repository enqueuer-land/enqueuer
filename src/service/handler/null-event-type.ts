import {StartEventType} from "./start-event-type";
import {Report} from "../../report/report";

export class NullEventType implements StartEventType{
    start(): Promise<void> {
        return Promise.resolve();
    }

    generateReport(): Report {
        throw new Report();
    }
}

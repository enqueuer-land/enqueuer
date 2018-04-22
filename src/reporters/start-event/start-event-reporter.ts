import {Report} from "../../reports/report";
import {Reporter} from "../reporter";

export abstract class StartEventReporter implements Reporter {
    abstract start(): Promise<void>;
    abstract getReport(): Report;
}
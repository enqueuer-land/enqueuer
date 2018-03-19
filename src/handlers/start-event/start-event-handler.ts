import {Report} from "../../reporters/report";
import {Reporter} from "../../reporters/reporter";

export abstract class StartEventHandler implements Reporter {
    abstract start(): Promise<void>;
    abstract getReport(): Report;
}
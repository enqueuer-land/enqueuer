import {Report} from "../reports/report";

export interface Reporter {
    getReport(): Report;
}
import {Report} from "./report";

export interface Reporter {
    getReport(): Report;
}
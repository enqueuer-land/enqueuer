import { Report } from "../report";

export interface ReportReplier {
    report(report: Report): boolean;
}
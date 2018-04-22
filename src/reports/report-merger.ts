import {Reporter} from "../reporters/reporter";
import {Report} from "./report";

export class ReportMerger implements Reporter {
    private valid: boolean = true;
    private errorsDescription: string[] = [];
    private reports: {}[] = [];

    constructor(reports: Report[] = []) {
        for(const report of reports)
            this.addReport(report);
    }

    public addReport(newReport: Report): void {
        const newReportId = newReport.name || newReport.id || this.reports.length;
        this.reports.push(newReport);
        this.valid = this.valid && newReport.valid;

        newReport.errorsDescription.forEach(newError => {
            this.errorsDescription.push(`[${newReportId}]${newError}`)
        })
    }

    public getReport(): Report {
        return {
            valid: this.valid,
            errorsDescription: this.errorsDescription
        };
    }
}
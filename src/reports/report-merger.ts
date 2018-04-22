import {Reporter} from "../reporters/reporter";
import {Report} from "./report";

export class ReportMerger implements Reporter {
    private name: string;
    private valid: boolean = true;
    private errorsDescription: string[] = [];
    private reports: any = {};

    constructor(name: string, reports: Report[] = []) {
        this.name = name;
        for(const report of reports)
            this.addReport(report);
    }

    public addReport(newReport: Report): Report {
        this.reports[newReport.name] = newReport as Report;
        this.valid = this.valid && newReport.valid;

        for (const newError of newReport.errorsDescription || []) {
            this.errorsDescription.push(`[${newReport.name}]${newError}`)
        };
        return newReport;
    }

    public getReport(): Report {
        return {
            name: this.name,
            valid: this.valid,
            errorsDescription: this.errorsDescription,
            ...this.reports
        };
    }
}
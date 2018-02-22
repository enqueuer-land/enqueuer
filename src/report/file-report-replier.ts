import { ReportReplier } from "./report-replier";
import { Report } from "./report";
const fs = require("fs");

export class FileReportReplier implements ReportReplier {

    private filename: string = "";
    constructor(file: any) {
        this.filename = file.name;
    }

    report(report: Report): boolean {
        fs.writeFileSync(this.filename, report.toString());
        return true;
    }
}
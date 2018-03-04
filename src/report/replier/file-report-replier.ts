import { ReportReplier } from "./report-replier";
const fs = require("fs");

export class FileReportReplier implements ReportReplier {

    private filename: string = "";
    constructor(file: any) {
        this.filename = file.name;
    }

    report(report: string): boolean {
        fs.writeFileSync(this.filename, report);
        return true;
    }
}
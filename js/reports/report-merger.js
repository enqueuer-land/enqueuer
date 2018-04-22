"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReportMerger {
    constructor(name, reports = []) {
        this.valid = true;
        this.errorsDescription = [];
        this.reports = {};
        this.name = name;
        for (const report of reports)
            this.addReport(report);
    }
    addReport(newReport) {
        this.reports[newReport.name] = newReport;
        this.valid = this.valid && newReport.valid;
        for (const newError of newReport.errorsDescription || []) {
            this.errorsDescription.push(`[${newReport.name}]${newError}`);
        }
        ;
        return newReport;
    }
    getReport() {
        return Object.assign({ name: this.name, valid: this.valid, errorsDescription: this.errorsDescription }, this.reports);
    }
}
exports.ReportMerger = ReportMerger;

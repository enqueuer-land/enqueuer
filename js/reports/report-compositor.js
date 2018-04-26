"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const report_1 = require("./report");
const logger_1 = require("../loggers/logger");
class ReportCompositor {
    constructor(name) {
        this.subReports = {};
        this.additionalInfo = {};
        this.report = new report_1.Report(name);
    }
    addSubReport(newReport) {
        newReport = this.removeUselessFields(newReport);
        const newReportName = newReport.name;
        logger_1.Logger.trace(`Adding to '${this.report.name}' subreport '${newReportName}'`);
        delete newReport.name;
        this.subReports[newReportName] = newReport;
        this.report.valid = this.report.valid && newReport.valid;
        return this;
    }
    addError(error) {
        return this.addTest(error, false);
    }
    addSuccess(success) {
        return this.addTest(success, true);
    }
    addTest(title, success) {
        this.report.addTest(title, success);
        return this;
    }
    addInfo(info) {
        this.additionalInfo = Object.assign({}, this.additionalInfo, info);
        return this;
    }
    mergeReport(reportToMerge) {
        logger_1.Logger.debug(`Merging '${this.report.name}' with new one '${reportToMerge.name}'`);
        if (reportToMerge.tests)
            reportToMerge.tests.forEach((test) => this.report.addTest(test.name, test.valid));
        this.report.valid = this.report.valid && reportToMerge.valid;
        delete reportToMerge.tests;
        delete reportToMerge.valid;
        delete reportToMerge.name;
        this.additionalInfo = Object.assign({}, this.additionalInfo, reportToMerge);
        return this;
    }
    removeUselessFields(value) {
        let clone = {};
        Object.keys(value)
            .filter(k => value[k] !== null && value[k] !== undefined) // Remove undef. and null.
            .filter(k => Array.isArray(value[k]) ? value[k].length > 0 : true) // Remove undef. and null.
            .map((key) => clone[key] = value[key]);
        if (clone.success && clone.success.length == 0)
            delete clone.success;
        if (clone.errors && clone.errors.length == 0)
            delete clone.errors;
        return clone;
    }
    snapshot() {
        return this.removeUselessFields(Object.assign(this.report, this.subReports, this.additionalInfo));
    }
}
exports.ReportCompositor = ReportCompositor;

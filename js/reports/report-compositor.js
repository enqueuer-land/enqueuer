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
    addTest(title, success) {
        this.report.addTest(title, success);
        return this;
    }
    addInfo(info) {
        this.additionalInfo = Object.assign({}, this.additionalInfo, info);
        return this;
    }
    removeUselessFields(value) {
        let clone = {};
        Object.keys(value)
            .filter(k => value[k] !== null && value[k] !== undefined) // Remove undef. and null.
            .filter(k => typeof value[k] == 'object' ? Object.keys(value[k]).length > 0 : true) // Remove undef. and null.
            .filter(k => Array.isArray(value[k]) ? value[k].length > 0 : true) // Remove undef. and null.
            .map((key) => clone[key] = value[key]);
        return clone;
    }
    snapshot() {
        const fields = this.removeUselessFields(Object.assign(this.report, this.subReports, this.additionalInfo));
        const tests = fields.tests;
        if (tests && tests.length > 0) {
            fields.tests = tests.map((test) => {
                let testSummary = {};
                testSummary[test.name] = test.valid;
                return testSummary;
            });
        }
        return fields;
    }
}
exports.ReportCompositor = ReportCompositor;

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
        logger_1.Logger.debug(`Adding to '${this.report.name}' subreport '${newReport.name}'`);
        this.subReports[newReport.name] = newReport;
        this.addValidationCondition(newReport.valid);
        for (const newError of newReport.errorsDescription) {
            this.report.errorsDescription.push(`[${newReport.name}]${newError}`);
            this.addValidationCondition(false);
        }
        ;
        return this;
    }
    addErrorsDescription(error) {
        this.report.errorsDescription.push(error);
        this.report.valid = false;
        return this;
    }
    addInfo(info) {
        this.additionalInfo = Object.assign({}, this.additionalInfo, info);
        return this;
    }
    mergeReport(reportToMerge) {
        logger_1.Logger.debug(`Merging '${this.report.name}' with new one '${reportToMerge.name}'`);
        this.report.errorsDescription = this.report.errorsDescription.concat(reportToMerge.errorsDescription);
        this.report.valid = this.report.valid && reportToMerge.valid;
        delete reportToMerge.errorsDescription;
        delete reportToMerge.valid;
        delete reportToMerge.name;
        this.additionalInfo = Object.assign({}, this.additionalInfo, reportToMerge);
        return this;
    }
    addValidationCondition(valid) {
        this.report.valid = this.report.valid && valid;
        return this;
    }
    snapshot() {
        const assign = Object.assign(this.report, this.subReports, this.additionalInfo);
        // console.log(`Snapshot: ${JSON.stringify(assign, null, 2)}`);
        return assign;
    }
}
exports.ReportCompositor = ReportCompositor;

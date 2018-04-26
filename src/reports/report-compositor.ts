import {Report, Test} from "./report";
import {Logger} from "../loggers/logger";
import {isNullOrUndefined, isUndefined} from "util";

export class ReportCompositor {
    private report: Report;
    private subReports: any = {};
    private additionalInfo = {};

    constructor(name: string) {
        this.report = new Report(name);
    }

    public addSubReport(newReport: Report): ReportCompositor {
        newReport = this.removeUselessFields(newReport);
        const newReportName = newReport.name;
        Logger.trace(`Adding to '${this.report.name}' subreport '${newReportName}'`);
        delete newReport.name;
        this.subReports[newReportName] = newReport;
        this.report.valid = this.report.valid && newReport.valid;

        return this;
    }

    public addTest(title: string, success: boolean): ReportCompositor {
        this.report.addTest(title, success);
        return this;
    }

    public addInfo(info: {}): ReportCompositor {
        this.additionalInfo = {
            ...this.additionalInfo,
            ...info
        }
        return this;
    }

    public mergeReport(reportToMerge: Report): ReportCompositor {
        Logger.debug(`Merging '${this.report.name}' with new one '${reportToMerge.name}'`);

        if (reportToMerge.tests)
            reportToMerge.tests.forEach((test: Test) => this.report.addTest(test.name, test.valid));
        this.report.valid = this.report.valid && reportToMerge.valid;
        delete reportToMerge.tests;
        delete reportToMerge.valid;
        delete reportToMerge.name;
        this.additionalInfo = Object.assign({}, this.additionalInfo, reportToMerge);
        return this;
    }

    private removeUselessFields(value: any) {
        let clone: any = {};
        Object.keys(value)
            .filter(k => value[k] !== null && value[k] !== undefined )  // Remove undef. and null.
            .filter(k => Array.isArray(value[k]) ? value[k].length > 0: true)  // Remove undef. and null.
            .map((key) => clone[key] = value[key]);
        if (clone.success && clone.success.length == 0)
            delete clone.success;
        if (clone.errors && clone.errors.length == 0)
            delete clone.errors;
        return clone;
    }

    public snapshot(): any {
        return this.removeUselessFields(Object.assign(this.report, this.subReports, this.additionalInfo));
    }
}
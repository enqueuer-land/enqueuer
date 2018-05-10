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
        Logger.debug(`Adding to '${this.report.name}' subReport '${newReportName}'`);
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

    private removeUselessFields(value: any) {
        let clone: any = {};
        Object.keys(value)
            .filter(k => value[k] !== null && value[k] !== undefined )  // Remove undef. and null.
            .filter(k => typeof value[k] == 'object'? Object.keys(value[k]).length > 0: true )  // Remove undef. and null.
            .filter(k => Array.isArray(value[k]) ? value[k].length > 0: true)  // Remove undef. and null.
            .map((key) => clone[key] = value[key]);
        return clone;
    }

    public snapshot(): any {
        const fields = this.removeUselessFields(Object.assign(this.report, this.subReports, this.additionalInfo));
        const tests = fields.tests;
        if (tests && tests.length > 0) {
            fields.tests = tests.map((test: Test) => {
                let testSummary: any = {};
                testSummary[test.name] = test.valid;
                return testSummary;
            })
        }

        return fields;
    }
}
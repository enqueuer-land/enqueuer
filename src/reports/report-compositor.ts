import {Report} from "./report";
import {Logger} from "../loggers/logger";

export class ReportCompositor {
    private report: Report;
    private subReports: any = {};
    private additionalInfo = {};

    constructor(name: string) {
        this.report = new Report(name);
    }

    public addSubReport(newReport: Report): ReportCompositor {
        Logger.debug(`Adding to '${this.report.name}' subreport '${newReport.name}'`);
        this.subReports[newReport.name] = newReport;
        this.addValidationCondition(newReport.valid)

        for (const newError of newReport.errorsDescription) {
            this.report.errorsDescription.push(`[${newReport.name}]${newError}`)
            this.addValidationCondition(false)
        };
        return this;
    }

    public addErrorsDescription(error: string): ReportCompositor {
        this.report.errorsDescription.push(error);
        this.report.valid = false;
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
        this.report.errorsDescription = this.report.errorsDescription.concat(reportToMerge.errorsDescription);
        this.report.valid = this.report.valid && reportToMerge.valid;
        delete reportToMerge.errorsDescription;
        delete reportToMerge.valid;
        delete reportToMerge.name;
        this.additionalInfo = Object.assign({}, this.additionalInfo, reportToMerge);
        return this;
    }

    public addValidationCondition(valid: boolean): ReportCompositor {
        this.report.valid = this.report.valid && valid;
        return this;
    }

    public snapshot(): any {
        return Object.assign(this.report, this.subReports, this.additionalInfo);
    }
}
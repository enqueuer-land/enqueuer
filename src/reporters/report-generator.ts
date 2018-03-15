import {DateController} from "../dates/date-controller";
import {Report} from "./report";

export class ReportGenerator {

    private startTime: DateController | null = null;
    private timeout: number | undefined;

    private requisitionReports: Report;
    private startEventReports?: Report;
    private subscriptionReports?: Report;

    private error: any = undefined;

    public constructor(requisitionId: string) {
        this.requisitionReports = {
            id: requisitionId,
            enqueuer: {
                version: process.env.npm_package_version
            },
            report: {
                version: process.env.npm_package_version
            },
            valid: false
        };
    }

    public start(timeout: number | undefined) {
        this.startTime = new DateController();
        this.timeout = timeout;
    }

    public setStartEventReport(startEventReports: Report): void {
        this.startEventReports = startEventReports;
    }

    public setSubscriptionReport(subscriptionReport: Report): void {
        this.subscriptionReports = subscriptionReport;
    }

    public generate(): string {
        let report = JSON.parse(JSON.stringify(this.requisitionReports));
        report.error = this.error;
        report.subscriptionReports = this.subscriptionReports;
        report.startEventReports = this.startEventReports;
        return JSON.stringify(report);
    }

    public finish(): void {
        this.addValidResult();
        this.addTimesReport();
    }

    public addError(error: any): any {
        this.error = error;
    }

    private addValidResult() {
        let valid: boolean  = false;
        valid = (this.startEventReports && this.startEventReports.valid) &&
                    (this.subscriptionReports && this.subscriptionReports.valid) || valid;
        if (valid && this.timeout && this.startTime)
            valid = (new DateController().getTime() - this.startTime.getTime()) > this.timeout;

        this.requisitionReports.valid = valid;
    }

    private addTimesReport(): {} | null {
        if (this.startTime) {
            let timesReport: any = {};
            const endDate = new DateController();
            timesReport.totalTime = endDate.getTime() - this.startTime.getTime();
            timesReport.startTime = this.startTime.toString();
            timesReport.endTime = endDate.toString();
            if (this.timeout) {
                timesReport.timeout = this.timeout;
                timesReport.hasTimedOut = (timesReport.totalTime > this.timeout);
            }

            this.requisitionReports.time = timesReport;
        }
        return null;
    }

}
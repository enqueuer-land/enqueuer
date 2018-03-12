import {DateController} from "../dates/date-controller";

export class ReportGenerator {

    private startTime: DateController | null = null;
    private timeout: number | undefined;

    private requisitionReports: any = {};
    private startEventReports: any;
    private subscriptionReports: any;

    private error: any = undefined;

    public constructor(requisitionId: string) {
        this.addInitialInformation(requisitionId);
    }

    public start(timeout: number | undefined) {
        this.startTime = new DateController();
        this.timeout = timeout;
    }

    private addRequisitionReports(requisitionReports: any): void {
        for (const key in requisitionReports) {
            this.requisitionReports[key] = requisitionReports[key];
        }
    }

    public setStartEventReport(startEventReports: any): any {
        this.startEventReports = startEventReports;
    }

    public setSubscriptionReport(subscriptionReport: any): void {
        this.subscriptionReports = subscriptionReport;
    }

    public generate(): string {
        let report = JSON.parse(JSON.stringify(this.requisitionReports));
        report.error = this.error;
        report.subscriptionReports = this.subscriptionReports;
        report.startEventReports = this.startEventReports;
        return JSON.stringify(report);
    }

    public finish(): any {
        this.addValidResult();
        this.addTimesReport();
    }

    public addError(error: any): any {
        this.error = error;
    }

    private addValidResult() {
        let valid = (this.startEventReports && this.startEventReports.valid) &&
            (this.subscriptionReports && this.subscriptionReports.valid);
        if (valid && this.timeout && this.startTime)
            valid = (new DateController().getTime() - this.startTime.getTime()) > this.timeout;
        this.addRequisitionReports({valid: valid});
    }

    private addInitialInformation(requisitionId: string) {
        this.addRequisitionReports({
            id: requisitionId,
            enqueuer: {
                version: process.env.npm_package_version
            },
            report: {
                version: process.env.npm_package_version
            }
        })
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
            this.addRequisitionReports({ time: timesReport});
        }
        return null;
    }

}
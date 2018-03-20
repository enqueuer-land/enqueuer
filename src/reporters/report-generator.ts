import {DateController} from "../timers/date-controller";
import {Report} from "./report";
import {Logger} from "../loggers/logger";

export class ReportGenerator {

    private startTime?: DateController;
    private timeout?: number;

    private requisitionReports: Report;
    private startEventReports?: Report;
    private subscriptionReports?: Report;

    public constructor(requisitionId: string) {
        this.requisitionReports = {
            id: requisitionId,
            enqueuer: {
                version: process.env.npm_package_version || "1.0.0"
            },
            report: {
                version: process.env.npm_package_version || "1.0.0"
            },
            valid: false,
            errorsDescription: []
        };
    }

    public start(timeout?: number) {
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
        report.subscriptionReports = this.subscriptionReports;
        report.startEventReports = this.startEventReports;
        return JSON.stringify(report);
    }

    public finish(): void {
        this.addValidResult();
        this.addErrorsResult();
        this.addTimesReport();
    }

    public addError(error: any): any {
        this.requisitionReports.errorsDescription.push(error);
    }

    private addValidResult() {
        const validStartEvent = this.startEventReports && this.startEventReports.valid;
        const validMultiSubscription = this.subscriptionReports && this.subscriptionReports.valid;
        let valid: boolean = (validStartEvent && validMultiSubscription) || false;
        if (valid && this.timeout && this.startTime)
        {
            const hasTimedOut = (new DateController().getTime() - this.startTime.getTime()) > this.timeout;
            valid = !hasTimedOut;
        }

        this.requisitionReports.valid = valid;
    }

    private addErrorsResult() {
        if (this.startEventReports)
            this.requisitionReports.errorsDescription = this.requisitionReports.errorsDescription.concat(this.startEventReports.errorsDescription)
        if (this.subscriptionReports)
            this.requisitionReports.errorsDescription = this.requisitionReports.errorsDescription.concat(this.subscriptionReports.errorsDescription)
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
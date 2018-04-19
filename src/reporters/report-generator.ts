import {DateController} from "../timers/date-controller";
import {Report} from "./report";
import {Reporter} from "./reporter";
import {RequisitionModel} from "../requisitions/models/requisition-model";

export class ReportGenerator implements Reporter {

    private startTime?: DateController;
    private timeout?: number;

    private requisitionReports: Report;
    private startEventReports?: Report;
    private subscriptionReports?: Report;

    public constructor(requisitionAttributes: RequisitionModel) {
        this.requisitionReports = {
            id: requisitionAttributes.id,
            enqueuer: {
                version: process.env.npm_package_version || "1.0.0"
            },
            report: {
                version: process.env.npm_package_version || "1.0.0"
            },
            valid: false,
            errorsDescription: []
        };
        if (requisitionAttributes.name)
            this.requisitionReports.name = requisitionAttributes.name;
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

    public getReport(): Report {
        let report = JSON.parse(JSON.stringify(this.requisitionReports));
        report.subscriptionReports = this.subscriptionReports;
        report.startEventReports = this.startEventReports;
        return report;
    }

    public finish(): void {
        this.addValidResult();
        this.addErrorsResult();
        this.addTimesReport();
    }

    public addError(error: string): any {
        this.requisitionReports.errorsDescription.push(`[Requisition] ${error}`);
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
        if (this.startEventReports) {
            this.startEventReports.errorsDescription.forEach(error => {
                this.requisitionReports.errorsDescription.push(`[Start Event] ${error}`);
            })
        }
        if (this.subscriptionReports) {
            this.subscriptionReports.errorsDescription.forEach(error => {
                this.requisitionReports.errorsDescription.push(`[Subscription]${error}`);
            })
        }
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
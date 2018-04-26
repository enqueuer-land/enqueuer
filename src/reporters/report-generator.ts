import {DateController} from "../timers/date-controller";
import {Report} from "../reports/report";
import {Reporter} from "./reporter";
import {RequisitionModel} from "../models/requisition-model";
import {ReportCompositor} from "../reports/report-compositor";

export class ReportGenerator implements Reporter {

    private startTime?: DateController;
    private timeout?: number;

    private requisitionReports: ReportCompositor;

    public constructor(requisitionAttributes: RequisitionModel) {
        this.requisitionReports = new ReportCompositor(requisitionAttributes.name);
    }

    public start(timeout?: number) {
        this.startTime = new DateController();
        this.timeout = timeout;
    }

    public setStartEventReport(startEventReports: Report): void {
        this.requisitionReports.addSubReport(startEventReports);
    }

    public setSubscriptionReport(subscriptionReport: Report): void {
        this.requisitionReports.addSubReport(subscriptionReport);
    }

    public getReport(): Report {
        return this.requisitionReports.snapshot();
    }

    public finish(): void {
        this.addTimesReport();
    }

    public addError(error: string): any {
        this.requisitionReports.addTest(`${error}`, false);
    }

    private addTimesReport(): void{
        if (this.startTime) {
            let timesReport: any = {};
            const endDate = new DateController();
            timesReport.totalTime = endDate.getTime() - this.startTime.getTime();
            timesReport.startTime = this.startTime.toString();
            timesReport.endTime = endDate.toString();
            if (this.timeout) {
                timesReport.timeout = this.timeout;
                timesReport.hasTimedOut = (timesReport.totalTime > this.timeout);
                this.requisitionReports.addTest(`No time out`, !timesReport.hasTimedOut);
            }

            this.requisitionReports.addInfo({time: timesReport});
        }
    }

}
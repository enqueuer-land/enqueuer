import {DateController} from "../timers/date-controller";
import * as input from "../models/inputs/requisition-model";
import * as output from "../models/outputs/requisition-model";
import {StartEventModel} from "../models/outputs/start-event-model";
import {SubscriptionModel} from "../models/outputs/subscription-model";
import {RequisitionModel} from "../models/outputs/requisition-model";
import {checkValidation} from "../models/outputs/report-model";

export class ReportGenerator {

    private startTime?: DateController;
    private timeout?: number;

    private report: output.RequisitionModel;

    public constructor(requisitionAttributes: input.RequisitionModel) {
        this.report = {
            type: "requisition",
            valid: true,
            tests: {},
            name: requisitionAttributes.name,
            time: {
                startTime: "",
                endTime: "",
                totalTime: 0
            },
            subscriptions: [],
            startEvent: {}
        }
    }

    public start(timeout?: number) {
        this.startTime = new DateController();
        this.timeout = timeout;
    }

    public setStartEventReport(startEventReports: StartEventModel): void {
        this.report.startEvent = startEventReports;
        if (this.report.startEvent.publisher)
            this.report.valid = this.report.valid && this.report.startEvent.publisher.valid;
        if (this.report.startEvent.subscription)
            this.report.valid = this.report.valid && this.report.startEvent.subscription.valid;
    }

    public setSubscriptionReport(subscriptionReport: SubscriptionModel[]): void {
        this.report.subscriptions = subscriptionReport;
        this.report.subscriptions.forEach(subscriptionReport => {
            this.report.valid = this.report.valid && subscriptionReport.valid;
        })
    }

    public getReport(): RequisitionModel {
        this.report.valid = this.report.valid && checkValidation(this.report);
        return this.report;
    }

    public finish(): void {
        this.addTimesReport();
    }

    public addError(error: string): any {
        this.report.tests[error] = false;
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
                this.report.tests[`No time out`] = timesReport.totalTime <= this.timeout;
            }

            this.report.time = timesReport;
        }
    }

}
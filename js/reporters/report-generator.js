"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
class ReportGenerator {
    constructor(requisitionAttributes) {
        this.requisitionReports = {
            name: requisitionAttributes.name,
            valid: false,
            errorsDescription: []
        };
        if (requisitionAttributes.name)
            this.requisitionReports.name = requisitionAttributes.name;
    }
    start(timeout) {
        this.startTime = new date_controller_1.DateController();
        this.timeout = timeout;
    }
    setStartEventReport(startEventReports) {
        this.startEventReports = startEventReports;
    }
    setSubscriptionReport(subscriptionReport) {
        this.subscriptionReports = subscriptionReport;
    }
    getReport() {
        let report = JSON.parse(JSON.stringify(this.requisitionReports));
        report.subscriptionReports = this.subscriptionReports;
        report.startEventReports = this.startEventReports;
        return report;
    }
    finish() {
        this.addValidResult();
        this.addErrorsResult();
        this.addTimesReport();
    }
    addError(error) {
        if (this.requisitionReports.errorsDescription)
            this.requisitionReports.errorsDescription.push(`[Requisition] ${error}`);
    }
    addValidResult() {
        const validStartEvent = this.startEventReports && this.startEventReports.valid;
        const validMultiSubscription = this.subscriptionReports && this.subscriptionReports.valid;
        let valid = (validStartEvent && validMultiSubscription) || false;
        if (valid && this.timeout && this.startTime) {
            const hasTimedOut = (new date_controller_1.DateController().getTime() - this.startTime.getTime()) > this.timeout;
            valid = !hasTimedOut;
        }
        this.requisitionReports.valid = valid;
    }
    addErrorsResult() {
        if (this.startEventReports && this.startEventReports.errorsDescription) {
            this.startEventReports.errorsDescription.forEach(error => {
                if (this.requisitionReports.errorsDescription)
                    this.requisitionReports.errorsDescription.push(`[Start Event] ${error}`);
            });
        }
        if (this.subscriptionReports && this.subscriptionReports.errorsDescription) {
            this.subscriptionReports.errorsDescription.forEach(error => {
                if (this.requisitionReports.errorsDescription)
                    this.requisitionReports.errorsDescription.push(`[Subscription]${error}`);
            });
        }
    }
    addTimesReport() {
        if (this.startTime) {
            let timesReport = {};
            const endDate = new date_controller_1.DateController();
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
exports.ReportGenerator = ReportGenerator;

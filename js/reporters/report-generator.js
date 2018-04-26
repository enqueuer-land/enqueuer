"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
const report_compositor_1 = require("../reports/report-compositor");
class ReportGenerator {
    constructor(requisitionAttributes) {
        this.requisitionReports = new report_compositor_1.ReportCompositor(requisitionAttributes.name);
    }
    start(timeout) {
        this.startTime = new date_controller_1.DateController();
        this.timeout = timeout;
    }
    setStartEventReport(startEventReports) {
        this.requisitionReports.addSubReport(startEventReports);
    }
    setSubscriptionReport(subscriptionReport) {
        this.requisitionReports.addSubReport(subscriptionReport);
    }
    getReport() {
        return this.requisitionReports.snapshot();
    }
    finish() {
        this.addTimesReport();
    }
    addError(error) {
        this.requisitionReports.addError(`${error}`);
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
                if (timesReport.hasTimedOut)
                    this.requisitionReports.addError(`Timed out`);
                else
                    this.requisitionReports.addSuccess(`No timeout`);
            }
            this.requisitionReports.addInfo({ time: timesReport });
        }
    }
}
exports.ReportGenerator = ReportGenerator;

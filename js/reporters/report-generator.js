"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
const requisition_default_reports_1 = require("../models-defaults/outputs/requisition-default-reports");
class ReportGenerator {
    constructor(requisitionAttributes) {
        this.startTime = new date_controller_1.DateController();
        this.report = requisition_default_reports_1.RequisitionDefaultReports.createDefaultReport(requisitionAttributes.name);
    }
    start(timeout) {
        this.startTime = new date_controller_1.DateController();
        this.timeout = timeout;
    }
    setPublishersReport(publishersReport) {
        this.report.publishers = publishersReport;
    }
    setSubscriptionsReport(subscriptionReport) {
        this.report.subscriptions = subscriptionReport;
    }
    getReport() {
        this.report.valid = (this.report.subscriptions || []).every(report => report.valid) &&
            (this.report.publishers || []).every(report => report.valid) &&
            this.report.tests.every(report => report.valid);
        return this.report;
    }
    finish() {
        this.addTimesReport();
    }
    addError(error) {
        const errorTest = {
            valid: false,
            name: error.name,
            description: error.description
        };
        this.report.tests.push(errorTest);
    }
    addTests(tests) {
        this.report.tests = this.report.tests.concat(tests);
    }
    addTimesReport() {
        let timesReport = this.generateTimesReport();
        this.report.time = timesReport;
        if (this.timeout) {
            this.report.time.timeout = this.timeout;
            const timeoutTest = this.createTimeoutTest(this.report.time);
            this.report.tests.push(timeoutTest);
        }
    }
    generateTimesReport() {
        const endDate = new date_controller_1.DateController();
        return {
            startTime: this.startTime.toString(),
            endTime: endDate.toString(),
            totalTime: endDate.getTime() - this.startTime.getTime()
        };
    }
    createTimeoutTest(timesReport) {
        const timeoutTest = {
            valid: false,
            name: 'No time out',
            description: `Requisition has timed out: ${timesReport.totalTime} > ${this.timeout}`
        };
        if (timesReport.totalTime <= timesReport.timeout) {
            timeoutTest.valid = true;
            timeoutTest.description = 'Requisition has not timed out';
        }
        return timeoutTest;
    }
}
exports.ReportGenerator = ReportGenerator;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
const requisition_default_reports_1 = require("../models-defaults/outputs/requisition-default-reports");
//TODO test it
class ReportGenerator {
    constructor(requisitionAttributes) {
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
        if (this.startTime) {
            let timesReport = this.generateTimesReport();
            if (timesReport) {
                this.report.time = timesReport;
                const timeoutTest = this.createTimeoutTest(timesReport);
                if (timeoutTest) {
                    this.report.tests.push(timeoutTest);
                }
            }
        }
    }
    generateTimesReport() {
        if (this.startTime) {
            const endDate = new date_controller_1.DateController();
            return {
                startTime: this.startTime.toString(),
                endTime: endDate.toString(),
                totalTime: endDate.getTime() - this.startTime.getTime(),
                timeout: this.timeout
            };
        }
    }
    createTimeoutTest(timesReport) {
        if (this.timeout) {
            const timeoutTest = {
                valid: false,
                name: 'No time out',
                description: `Requisition has timed out: ${timesReport.totalTime} > ${this.timeout}`
            };
            if (timesReport.totalTime <= this.timeout) {
                timeoutTest.valid = true;
                timeoutTest.description = 'Requisition has not timed out';
            }
            return timeoutTest;
        }
    }
}
exports.ReportGenerator = ReportGenerator;

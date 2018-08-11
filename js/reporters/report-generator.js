"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
const report_model_1 = require("../models/outputs/report-model");
class ReportGenerator {
    constructor(requisitionAttributes) {
        this.report = {
            type: 'requisition',
            valid: true,
            tests: [],
            name: requisitionAttributes.name,
            time: {
                startTime: '',
                endTime: '',
                totalTime: 0
            },
            subscriptions: [],
            startEvent: {}
        };
    }
    start(timeout) {
        this.startTime = new date_controller_1.DateController();
        this.timeout = timeout;
    }
    setStartEventReport(startEventReports) {
        this.report.startEvent = startEventReports;
        if (this.report.startEvent.publisher) {
            this.report.valid = this.report.valid && this.report.startEvent.publisher.valid;
        }
        if (this.report.startEvent.subscription) {
            this.report.valid = this.report.valid && this.report.startEvent.subscription.valid;
        }
    }
    setSubscriptionReport(subscriptionReport) {
        this.report.subscriptions = subscriptionReport;
        this.report.subscriptions.forEach(subscriptionReport => {
            this.report.valid = this.report.valid && subscriptionReport.valid;
        });
    }
    getReport() {
        this.report.valid = this.report.valid && report_model_1.checkValidation(this.report);
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
            let timesReport = {};
            const endDate = new date_controller_1.DateController();
            timesReport.totalTime = endDate.getTime() - this.startTime.getTime();
            timesReport.startTime = this.startTime.toString();
            timesReport.endTime = endDate.toString();
            this.addTimeoutReport(timesReport);
            this.report.time = timesReport;
        }
    }
    addTimeoutReport(timesReport) {
        if (this.timeout) {
            timesReport.timeout = this.timeout;
            const timeoutTest = {
                valid: false,
                name: 'No time out',
                description: `Requisition has timed out ${timesReport.totalTime} > ${this.timeout}`
            };
            if (timesReport.totalTime <= this.timeout) {
                timeoutTest.valid = true;
                timeoutTest.description = 'Requisition has not timed out';
            }
            this.report.tests.push(timeoutTest);
        }
    }
}
exports.ReportGenerator = ReportGenerator;

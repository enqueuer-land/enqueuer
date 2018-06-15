"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_controller_1 = require("../timers/date-controller");
const report_model_1 = require("../models/outputs/report-model");
class ReportGenerator {
    constructor(requisitionAttributes) {
        this.report = {
            type: 'requisition',
            valid: true,
            tests: {},
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
        this.report.tests[error] = false;
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
                this.report.tests[`No time out`] = timesReport.totalTime <= this.timeout;
            }
            this.report.time = timesReport;
        }
    }
}
exports.ReportGenerator = ReportGenerator;

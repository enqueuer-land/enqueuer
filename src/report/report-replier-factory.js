"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var standard_output_report_replier_1 = require("./standard-output-report-replier");
var file_report_replier_1 = require("./file-report-replier");
var http_report_replier_1 = require("./http-report-replier");
var mqtt_report_replier_1 = require("./mqtt-report-replier");
var ReportReplierFactory = /** @class */ (function () {
    function ReportReplierFactory() {
    }
    ReportReplierFactory.prototype.createReplierFactory = function (requisition) {
        var reports = requisition.reports;
        var reportRepliers = [];
        reports.forEach(function (report) {
            var protocol = report.protocol;
            if (protocol === "standardOutput")
                reportRepliers.push(new standard_output_report_replier_1.StandardOutputReporterReplier());
            if (protocol === "file")
                reportRepliers.push(new file_report_replier_1.FileReportReplier(report));
            if (protocol === "http")
                reportRepliers.push(new http_report_replier_1.HttpReportReplier(report));
            if (protocol === "mqtt")
                reportRepliers.push(new mqtt_report_replier_1.MqttReportReplier(report));
        });
        return reportRepliers;
    };
    return ReportReplierFactory;
}());
exports.ReportReplierFactory = ReportReplierFactory;

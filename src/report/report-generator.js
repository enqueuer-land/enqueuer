"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var report_1 = require("./report");
var command_line_parser_1 = require("../command-line/command-line-parser");
var ReportGenerator = /** @class */ (function () {
    function ReportGenerator() {
        this.info = {};
        this.publishReports = [];
        this.subscriptionReports = [];
        this.verboseMode = true;
        this.verboseMode = !command_line_parser_1.CommandLineParser.getInstance().getOptions().silentMode;
    }
    ReportGenerator.prototype.addInfo = function (infoMessage) {
        if (this.verboseMode)
            console.log(infoMessage);
        for (var key in infoMessage) {
            this.info[key] = infoMessage[key];
        }
    };
    ReportGenerator.prototype.addPublishReport = function (publishReports) {
        if (this.verboseMode)
            console.log(publishReports);
        this.publishReports = publishReports;
    };
    ReportGenerator.prototype.addSubscriptionReport = function (subscriptionReport) {
        if (this.verboseMode)
            console.log(subscriptionReport);
        this.subscriptionReports.push(subscriptionReport);
    };
    ReportGenerator.prototype.generate = function () {
        return new report_1.Report(this.info, this.publishReports, this.subscriptionReports);
    };
    return ReportGenerator;
}());
exports.ReportGenerator = ReportGenerator;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var report_1 = require("./report");
var configuration_1 = require("../conf/configuration");
var ReportGenerator = /** @class */ (function () {
    function ReportGenerator() {
        this.info = {};
        this.startEventReports = [];
        this.subscriptionReports = [];
        this.verboseMode = true;
        this.verboseMode = configuration_1.Configuration.isVerboseMode();
    }
    ReportGenerator.prototype.addInfo = function (infoMessage) {
        if (this.verboseMode)
            console.log(infoMessage);
        for (var key in infoMessage) {
            this.info[key] = infoMessage[key];
        }
    };
    ReportGenerator.prototype.addStartEventReport = function (startEventReports) {
        if (this.verboseMode)
            console.log(startEventReports);
        this.startEventReports = startEventReports;
    };
    ReportGenerator.prototype.addSubscriptionReport = function (subscriptionReport) {
        if (this.verboseMode)
            console.log(subscriptionReport);
        this.subscriptionReports.push(subscriptionReport);
    };
    ReportGenerator.prototype.generate = function () {
        return new report_1.Report(this.info, this.startEventReports, this.subscriptionReports);
    };
    return ReportGenerator;
}());
exports.ReportGenerator = ReportGenerator;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Report = /** @class */ (function () {
    function Report(infoMessages, startEventReports, subscriptionReports) {
        if (infoMessages === void 0) { infoMessages = {}; }
        if (startEventReports === void 0) { startEventReports = {}; }
        if (subscriptionReports === void 0) { subscriptionReports = {}; }
        this.infoMessages = infoMessages;
        this.startEventReports = startEventReports;
        this.subscriptionReports = subscriptionReports;
    }
    Report.prototype.toString = function () {
        return JSON.stringify(this, null, 4);
    };
    return Report;
}());
exports.Report = Report;

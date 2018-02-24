"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Report = /** @class */ (function () {
    function Report(infoMessages, publishReports, subscriptionReports) {
        if (infoMessages === void 0) { infoMessages = {}; }
        if (publishReports === void 0) { publishReports = {}; }
        if (subscriptionReports === void 0) { subscriptionReports = {}; }
        this.infoMessages = infoMessages;
        this.publishReports = publishReports;
        this.subscriptionReports = subscriptionReports;
    }
    Report.prototype.toString = function () {
        return JSON.stringify(this, null, 4);
    };
    return Report;
}());
exports.Report = Report;

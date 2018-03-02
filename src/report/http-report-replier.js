"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("../conf/configuration");
var request = require("request");
var HttpReportReplier = /** @class */ (function () {
    function HttpReportReplier(http) {
        this.endpoint = "";
        this.endpoint = http.endpoint;
    }
    HttpReportReplier.prototype.report = function (report) {
        request.post({
            url: this.endpoint,
            body: report.toString()
        }, function (error, response, body) {
            if (error) {
                if (configuration_1.Configuration.isVerboseMode())
                    console.log("Error to reply http report : " + error);
            }
        });
        return true;
    };
    return HttpReportReplier;
}());
exports.HttpReportReplier = HttpReportReplier;

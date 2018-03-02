"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var FileReportReplier = /** @class */ (function () {
    function FileReportReplier(file) {
        this.filename = "";
        this.filename = file.name;
    }
    FileReportReplier.prototype.report = function (report) {
        fs.writeFileSync(this.filename, report.toString());
        return true;
    };
    return FileReportReplier;
}());
exports.FileReportReplier = FileReportReplier;

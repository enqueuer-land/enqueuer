"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var prettyjson = require('prettyjson');
var options = {
    indent: 6,
    keysColor: "white",
    dashColor: "white"
};
var StandardOutputReporterReplier = /** @class */ (function () {
    function StandardOutputReporterReplier() {
    }
    StandardOutputReporterReplier.prototype.report = function (report) {
        console.log(prettyjson.render(report, options));
        return true;
    };
    return StandardOutputReporterReplier;
}());
exports.StandardOutputReporterReplier = StandardOutputReporterReplier;

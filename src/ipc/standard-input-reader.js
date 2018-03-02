"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var report_replier_factory_1 = require("../report/report-replier-factory");
var requisition_parser_1 = require("../service/requisition/requisition-parser");
var enqueuer_service_1 = require("../service/enqueuer-service");
var StandardInputReader = /** @class */ (function () {
    function StandardInputReader() {
        this.requisition = "";
        process.stdin.setEncoding('utf8');
        process.stdin.resume();
    }
    StandardInputReader.prototype.start = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            process.stdin.on('data', function (chunk) { return _this.requisition += chunk; });
            process.stdin.on('end', function () { return resolve(_this.requisition); });
        });
    };
    StandardInputReader.prototype.endInput = function () {
        var _this = this;
        process.stdin.pause();
        var parsedRequisition = new requisition_parser_1.RequisitionParser().parse(this.requisition);
        this.messengerService = new enqueuer_service_1.EnqueuerService(parsedRequisition);
        this.reportRepliers = new report_replier_factory_1.ReportReplierFactory().createReplierFactory(parsedRequisition);
        if (this.messengerService) {
            this.messengerService.start(function (report) { return _this.onFinish(report); });
        }
    };
    return StandardInputReader;
}());
exports.StandardInputReader = StandardInputReader;

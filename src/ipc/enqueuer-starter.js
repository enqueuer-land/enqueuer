"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uds_reader_1 = require("./uds-reader");
var requisition_parser_1 = require("../service/requisition/requisition-parser");
var report_replier_factory_1 = require("../report/report-replier-factory");
var enqueuer_service_1 = require("../service/enqueuer-service");
var file_requisition_reader_1 = require("./file-requisition-reader");
var standard_input_reader_1 = require("./standard-input-reader");
var log = require('why-is-node-running'); // should be your first require
// log();
var EnqueuerStarter = /** @class */ (function () {
    function EnqueuerStarter() {
        this.requisitionReaders = [];
    }
    EnqueuerStarter.prototype.start = function () {
        var _this = this;
        this.addAllReaders();
        this.requisitionReaders.forEach(function (reader) {
            reader.start()
                .then(function (requisition) {
                _this.startService(requisition);
                reader.start();
            });
        });
    };
    EnqueuerStarter.prototype.addAllReaders = function () {
        this.requisitionReaders.push(new file_requisition_reader_1.FileRequisitionReader());
        this.requisitionReaders.push(new standard_input_reader_1.StandardInputReader());
        this.requisitionReaders.push(new uds_reader_1.UdsReader());
    };
    EnqueuerStarter.prototype.startService = function (requisition) {
        var parsedRequisition = new requisition_parser_1.RequisitionParser().parse(requisition);
        var reportRepliers = new report_replier_factory_1.ReportReplierFactory().createReplierFactory(parsedRequisition);
        var enqueuerService = new enqueuer_service_1.EnqueuerService(parsedRequisition);
        enqueuerService.start(function (report) {
            reportRepliers.forEach(function (reportReplier) { return reportReplier.report(report); });
        });
    };
    return EnqueuerStarter;
}());
exports.EnqueuerStarter = EnqueuerStarter;

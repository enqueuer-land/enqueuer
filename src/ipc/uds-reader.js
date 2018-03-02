"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requisition_parser_1 = require("../service/requisition/requisition-parser");
var report_replier_factory_1 = require("../report/report-replier-factory");
var enqueuer_service_1 = require("../service/enqueuer-service");
var ipc = require('node-ipc');
ipc.config.id = 'enqueuer';
ipc.config.retry = 1500;
ipc.config.silent = true;
var UdsReader = /** @class */ (function () {
    function UdsReader() {
        this.messengerService = null;
        this.reportRepliers = [];
    }
    UdsReader.prototype.start = function (ipcCommunicatorCallback) {
        var _this = this;
        console.log("starting ipc-uds");
        ipc.serve(function () { return _this.onConnect(); });
        ipc.server.start();
    };
    UdsReader.prototype.stop = function () {
        ipc.server.end();
    };
    UdsReader.prototype.onConnect = function () {
        var _this = this;
        ipc.server.on('enqueuer-client', function (message, socket) { return _this.onMessageReceived(message, socket); });
    };
    UdsReader.prototype.onMessageReceived = function (message, socket) {
        var _this = this;
        var parsedRequisition = new requisition_parser_1.RequisitionParser().parse(message);
        this.messengerService = new enqueuer_service_1.EnqueuerService(parsedRequisition);
        this.reportRepliers = new report_replier_factory_1.ReportReplierFactory().createReplierFactory(parsedRequisition);
        if (this.messengerService) {
            this.messengerService.start(function (report) { return _this.onFinish(socket, report, message); });
        }
    };
    UdsReader.prototype.onFinish = function (socket, report, message) {
        this.reportRepliers.forEach(function (reportReplier) { return reportReplier.report(report); });
        ipc.server.emit(socket, 'message', report.toString());
    };
    return UdsReader;
}());
exports.UdsReader = UdsReader;

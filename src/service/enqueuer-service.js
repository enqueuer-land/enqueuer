"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var report_generator_1 = require("../report/report-generator");
var subscriptions_handler_1 = require("./handler/subscriptions-handler");
var start_event_handler_1 = require("./handler/start-event-handler");
var EnqueuerService = /** @class */ (function () {
    function EnqueuerService(requisition) {
        var _this = this;
        this.onFinishCallback = null;
        this.startTime = 0;
        this.reportGenerator = new report_generator_1.ReportGenerator();
        this.startEventHandler = new start_event_handler_1.StartEventHandler(requisition.startEvent);
        this.startEventHandler.setTimeoutCallback(function () { return _this.onFinish(); });
        this.subscriptionsHandler = new subscriptions_handler_1.SubscriptionsHandler(requisition.subscriptions);
    }
    EnqueuerService.prototype.start = function (onFinishCallback) {
        var _this = this;
        this.startTime = Date.now();
        this.reportGenerator.addInfo({ startTime: new Date().toString() });
        this.onFinishCallback = onFinishCallback;
        this.subscriptionsHandler.start(function () { return _this.onSubscriptionCompleted(); }, function () { return _this.onFinish(); });
    };
    EnqueuerService.prototype.onSubscriptionCompleted = function () {
        var _this = this;
        this.startEventHandler.start()
            .catch(function (err) {
            console.log(err);
            _this.onFinish();
        });
    };
    EnqueuerService.prototype.onFinish = function () {
        var totalTime = Date.now() - this.startTime;
        this.startEventHandler.cancelTimeout();
        this.reportGenerator.addSubscriptionReport(this.subscriptionsHandler.getReports());
        this.reportGenerator.addStartEventReport(this.startEventHandler.getReport());
        this.subscriptionsHandler.unsubscribe();
        this.reportGenerator.addInfo({ endTime: new Date().toString(), totalTime: totalTime });
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    };
    return EnqueuerService;
}());
exports.EnqueuerService = EnqueuerService;

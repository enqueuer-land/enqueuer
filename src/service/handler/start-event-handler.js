"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var subscriptions_handler_1 = require("./subscriptions-handler");
var publisher_handler_1 = require("./publisher-handler");
var publisher_factory_1 = require("../requisition/start-event/publish/publisher-factory");
var StartEventHandler = /** @class */ (function () {
    function StartEventHandler(startEvent) {
        this.publisherHandler = null;
        this.subscriptionHandler = null;
        this.report = {};
        this.timer = null;
        this.timeout = -1;
        this.onTimeoutCallback = function () { };
        if (startEvent.publisher) {
            var publisher = new publisher_factory_1.PublisherFactory().createPublisher(startEvent.publisher);
            if (publisher)
                this.publisherHandler = new publisher_handler_1.PublisherHandler(publisher);
        }
        else if (startEvent.subscription)
            this.subscriptionHandler = new subscriptions_handler_1.SubscriptionsHandler([startEvent.subscription]);
        this.timeout = startEvent.timeout;
    }
    StartEventHandler.prototype.start = function () {
        var _this = this;
        if (!this.timer)
            this.setTimeout();
        return new Promise(function (resolve, reject) {
            if (_this.publisherHandler) {
                _this.publisherHandler.publish()
                    .then(function (publisher) {
                    _this.generatePublishSuccessfulReport();
                    resolve();
                })
                    .catch(function (error) {
                    _this.generatePublishErrorReport(error);
                    reject(error);
                });
            }
            if (_this.subscriptionHandler) {
                _this.subscriptionHandler.start(function () { }, function () {
                    _this.checkSubscriptionMessageReceived()
                        .then(function () {
                        resolve();
                    })
                        .catch(function () { return reject(); });
                });
            }
        }).catch(function () {
            console.log("reject");
            if (_this.subscriptionHandler)
                return _this.start();
        });
    };
    StartEventHandler.prototype.getReport = function () {
        return this.report;
    };
    StartEventHandler.prototype.cancelTimeout = function () {
        if (this.timer)
            global.clearTimeout(this.timer);
        this.timer = null;
    };
    StartEventHandler.prototype.setTimeoutCallback = function (timeoutCalback) {
        this.onTimeoutCallback = timeoutCalback;
    };
    StartEventHandler.prototype.onTimeout = function () {
        this.cancelTimeout();
        this.onTimeoutCallback();
    };
    StartEventHandler.prototype.setTimeout = function () {
        var _this = this;
        console.log("timeout: " + this.timeout);
        if (this.timeout != -1) {
            this.timer = global.setTimeout(function () { return _this.onTimeout(); }, this.timeout);
        }
    };
    StartEventHandler.prototype.generatePublishSuccessfulReport = function () {
        if (this.publisherHandler)
            this.report = this.publisherHandler.getReport();
        this.report.timeout = this.timeout;
    };
    StartEventHandler.prototype.generatePublishErrorReport = function (error) {
        this.report = {
            error: error,
            timestamp: new Date()
        };
        this.report.timeout = this.timeout;
    };
    StartEventHandler.prototype.checkSubscriptionMessageReceived = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.subscriptionHandler) {
                var subscriptionReport = _this.subscriptionHandler.getReports();
                if (subscriptionReport[0].onMessageReceived.tests.failing.length > 0) {
                    if (!_this.report.failures)
                        _this.report.failures = [];
                    _this.report.failures.push(_this.subscriptionHandler.getReports());
                    reject();
                }
                else {
                    _this.report.success = _this.subscriptionHandler.getReports();
                    _this.report.success.timeout = _this.timeout;
                    _this.subscriptionHandler.unsubscribe();
                    resolve();
                }
            }
            reject();
        });
    };
    return StartEventHandler;
}());
exports.StartEventHandler = StartEventHandler;

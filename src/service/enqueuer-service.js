"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var class_transformer_1 = require("class-transformer");
var report_generator_1 = require("../report/report-generator");
var subscription_on_message_received_executor_1 = require("../function-executor/subscription-on-message-received-executor");
var publish_pre_publishing_executor_1 = require("../function-executor/publish-pre-publishing-executor");
var mqtt = require('mqtt');
var EnqueuerService = /** @class */ (function () {
    function EnqueuerService(requisition) {
        var _this = this;
        this.onFinishCallback = null;
        this.startTime = 0;
        this.timer = null;
        this.reportGenerator = new report_generator_1.ReportGenerator();
        this.requisition = class_transformer_1.classToClass(requisition); //clone
        this.client = mqtt.connect(requisition.brokerAddress); //, {connectTimeout:1000});
        this.client.on('message', function (topic, message) { return _this.onMessageReceived(topic, message); });
        this.subscribeToTopics();
    }
    EnqueuerService.prototype.start = function (onFinishCallback) {
        var _this = this;
        this.startTime = Date.now();
        this.reportGenerator.addInfo({ startTime: new Date().toString() });
        this.onFinishCallback = onFinishCallback;
        this.client.on('connect', function () { return _this.onConnect(); });
    };
    EnqueuerService.prototype.onConnect = function () {
        var _this = this;
        console.log("onConnect");
        if (this.timer == null) {
            this.requisition.startEvent.execute(function (message) { return _this.onStartEventReceived(message); });
        }
    };
    EnqueuerService.prototype.onStartEventReceived = function (startEvent) {
        console.log("Start event was fired");
        this.setTimeout(this.requisition.startEvent.timeout);
        // if (this.requisition.startEvent && this.requisition.startEvent.publish)
        this.publish();
        // if (this.requisition.startEvent && this.requisition.startEvent.subscription)
        //     this.requisition.startEvent.subscription.subscribe((message: any) => this.onStartEventReceived(message));
    };
    EnqueuerService.prototype.publish = function () {
        console.log("onPublish");
        // if (this.requisition.startEvent && this.requisition.startEvent.publish)
        //     this.requisition.startEvent.publish.execute();
        if (this.requisition.startEvent && this.requisition.startEvent.publish && this.requisition.startEvent.publish.mqtt) {
            this.client.publish(this.requisition.startEvent.publish.mqtt.topic, this.requisition.startEvent.publish.payload);
            var elapsedTime = Date.now() - this.startTime;
            var warning = {};
            try {
                new publish_pre_publishing_executor_1.PublishPrePublishingExecutor(this.requisition.startEvent.publish, { payload: this.requisition.startEvent.publish.payload,
                    topic: this.requisition.startEvent.publish.mqtt.topic });
            }
            catch (exception) {
                warning = exception;
            }
            this.reportGenerator.addPublishReport({
                publish: this.requisition.startEvent.publish,
                elapsedTime: elapsedTime,
                warning: warning
            });
        }
    };
    EnqueuerService.prototype.setTimeout = function (totalTimeout) {
        var _this = this;
        console.log("timeout: " + totalTimeout);
        if (totalTimeout != -1) {
            this.reportGenerator.addInfo({ totalTimeout: totalTimeout });
            this.timer = global.setTimeout(function () { return _this.onFinish(); }, totalTimeout);
        }
    };
    EnqueuerService.prototype.onMessageReceived = function (topic, payloadBuffer) {
        var payload = payloadBuffer.toString();
        var index = this.requisition.subscriptions.findIndex(function (subscription) {
            return subscription.mqtt != null && subscription.mqtt.topic == topic;
        });
        if (index > -1) {
            var subscription = this.requisition.subscriptions[index];
            this.requisition.subscriptions.splice(index, 1);
            this.generateSubscriptionReceivedMessageReport(subscription, { payload: payload, topic: topic });
            if (this.requisition.subscriptions.length === 0) {
                this.onFinish();
            }
        }
    };
    EnqueuerService.prototype.generateSubscriptionReceivedMessageReport = function (subscription, message) {
        var elapsedTime = Date.now() - this.startTime;
        var onMessageReceived = {};
        if (message) {
            try {
                var subscriptionTestExecutor = new subscription_on_message_received_executor_1.SubscriptionOnMessageReceivedExecutor(subscription, this.requisition.startEvent && this.requisition.startEvent.publish, message);
                subscriptionTestExecutor.execute();
                onMessageReceived = {
                    tests: {
                        failing: subscriptionTestExecutor.getFailingTests(),
                        passing: subscriptionTestExecutor.getPassingTests(),
                        onMessageReceivedExecutionException: subscriptionTestExecutor.getWarning()
                    },
                    reports: subscriptionTestExecutor.getReports()
                };
            }
            catch (exc) {
                onMessageReceived = {
                    onMessageReceivedFunctionCreationException: exc
                };
            }
        }
        var subscriptionReport = __assign({}, subscription, { elapsedTime: elapsedTime, timestamp: new Date(), message: message, onMessageReceived: onMessageReceived });
        this.reportGenerator.addSubscriptionReport(subscriptionReport);
    };
    EnqueuerService.prototype.generateSubscriptionDidNotReceivedMessageReport = function (subscription) {
        var elapsedTime = Date.now() - this.startTime;
        var subscriptionReport = __assign({}, subscription, { elapsedTime: elapsedTime, hasTimedOut: true });
        this.reportGenerator.addSubscriptionReport(subscriptionReport);
    };
    EnqueuerService.prototype.onSubscriptionMessage = function (subscriptionMessage) {
        console.log("Subscription valid");
    };
    EnqueuerService.prototype.subscribeToTopics = function () {
        var _this = this;
        this.requisition.subscriptions
            .forEach(function (subscription) {
            subscription.subscribe(function (subscriptionMessage) { return _this.onSubscriptionMessage(subscriptionMessage); });
            if (subscription.mqtt)
                _this.client.subscribe(subscription.mqtt.topic);
        });
    };
    EnqueuerService.prototype.onFinish = function () {
        var _this = this;
        if (this.timer)
            global.clearTimeout(this.timer);
        this.client.end(true);
        var totalTime = Date.now() - this.startTime;
        this.requisition.subscriptions
            .forEach(function (subscription) {
            _this.generateSubscriptionDidNotReceivedMessageReport(subscription);
        });
        this.reportGenerator.addInfo({ endTime: new Date().toString(), totalTime: totalTime });
        if (this.onFinishCallback)
            this.onFinishCallback(this.reportGenerator.generate());
    };
    return EnqueuerService;
}());
exports.EnqueuerService = EnqueuerService;

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var class_transformer_1 = require("class-transformer");
require("reflect-metadata");
var start_event_1 = require("./start-event/start-event");
var Requisition = /** @class */ (function () {
    function Requisition() {
        this.protocol = "";
        this.brokerAddress = "";
        this.subscriptions = [];
        this.startEvent = new start_event_1.StartEvent();
    }
    __decorate([
        class_transformer_1.Type(function () { return Subscription; })
    ], Requisition.prototype, "subscriptions", void 0);
    __decorate([
        class_transformer_1.Type(function () { return start_event_1.StartEvent; })
    ], Requisition.prototype, "startEvent", void 0);
    return Requisition;
}());
exports.Requisition = Requisition;
var Subscription = /** @class */ (function () {
    function Subscription() {
        this.mqtt = null;
        this.timeout = -1;
        this.onMessageReceived = null;
    }
    Subscription.prototype.subscribe = function (callback) {
        console.log("I should subscribe in this: " + JSON.stringify(this, null, 2));
        callback(this);
        return true;
    };
    Subscription.prototype.createOnMessageReceivedFunction = function () {
        if (this.onMessageReceived == null)
            return null;
        var fullBody = "let test = {}; let report = {}; " + this.onMessageReceived + ";return {test: test, report: report};";
        return new Function('message', 'startEvent', fullBody);
    };
    __decorate([
        class_transformer_1.Type(function () { return SubscribeMqtt; })
    ], Subscription.prototype, "mqtt", void 0);
    return Subscription;
}());
exports.Subscription = Subscription;
var SubscribeMqtt = /** @class */ (function () {
    function SubscribeMqtt() {
        this.brokerAddress = "";
        this.topic = "";
    }
    SubscribeMqtt.prototype.publish = function () {
        return true;
    };
    return SubscribeMqtt;
}());
exports.SubscribeMqtt = SubscribeMqtt;

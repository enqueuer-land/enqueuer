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
var report_1 = require("../../report/report");
var subscription_1 = require("./subscription/subscription");
var Requisition = /** @class */ (function () {
    function Requisition() {
        this.subscriptions = [];
        this.startEvent = new start_event_1.StartEvent();
        this.reports = [];
    }
    __decorate([
        class_transformer_1.Type(function () { return subscription_1.Subscription; })
    ], Requisition.prototype, "subscriptions", void 0);
    __decorate([
        class_transformer_1.Type(function () { return start_event_1.StartEvent; })
    ], Requisition.prototype, "startEvent", void 0);
    __decorate([
        class_transformer_1.Type(function () { return report_1.Report; })
    ], Requisition.prototype, "reports", void 0);
    return Requisition;
}());
exports.Requisition = Requisition;

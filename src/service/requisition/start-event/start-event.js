"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var StartEvent = /** @class */ (function () {
    function StartEvent() {
        this.timeout = -1;
        this.publish = null;
        this.subscription = null;
    }
    StartEvent.prototype.execute = function (eventCallback) {
        if (this.publish) {
            this.publish.eventCallback = eventCallback;
            this.publish.execute();
        }
        if (this.subscription)
            this.subscription.subscribe(eventCallback);
    };
    __decorate([
        Type(function () { return Publish; })
    ], StartEvent.prototype, "publish", void 0);
    __decorate([
        Type(function () { return Subscription; })
    ], StartEvent.prototype, "subscription", void 0);
    return StartEvent;
}());
exports.StartEvent = StartEvent;

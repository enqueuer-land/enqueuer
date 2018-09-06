"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const conditional_injector_1 = require("conditional-injector");
const daemon_input_adapter_1 = require("./daemon-input-adapter");
const logger_1 = require("../../loggers/logger");
let NullDaemonInputAdapter = class NullDaemonInputAdapter extends daemon_input_adapter_1.DaemonInputAdapter {
    constructor(subscription) {
        super();
        this.subscription = subscription;
    }
    adapt(message) {
        logger_1.Logger.warning(`Adapter is not being able to adapt daemon-input of ${JSON.stringify(this.subscription)}`);
        return undefined;
    }
};
NullDaemonInputAdapter = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], NullDaemonInputAdapter);
exports.NullDaemonInputAdapter = NullDaemonInputAdapter;

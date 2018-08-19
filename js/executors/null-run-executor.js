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
const enqueuer_executor_1 = require("./enqueuer-executor");
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
let NullRunExecutor = class NullRunExecutor extends enqueuer_executor_1.EnqueuerExecutor {
    constructor(enqueuerConfiguration) {
        super();
        logger_1.Logger.info('Executing in Not-Identified mode');
        this.enqueuerConfiguration = JSON.stringify(enqueuerConfiguration, null, 2);
    }
    execute() {
        return Promise.reject(new Error(`Impossible to execute new executor from: ${this.enqueuerConfiguration}`));
    }
};
NullRunExecutor = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], NullRunExecutor);
exports.NullRunExecutor = NullRunExecutor;

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
const http_authentication_1 = require("./http-authentication");
const logger_1 = require("../loggers/logger");
let NoAuthentication = class NoAuthentication extends http_authentication_1.HttpAuthentication {
    constructor() {
        super();
    }
    generate() {
        logger_1.Logger.warning('No authentication method was found to authenticate a HTTP requisition');
        return null;
    }
    verify(requisition) {
        logger_1.Logger.warning('No authentication method was found to verify an HTTP authentication');
        return [];
    }
};
NoAuthentication = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [])
], NoAuthentication);
exports.NoAuthentication = NoAuthentication;

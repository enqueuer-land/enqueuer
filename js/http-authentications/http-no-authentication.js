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
let HttpNoAuthentication = class HttpNoAuthentication extends http_authentication_1.HttpAuthentication {
    constructor(authentication) {
        super();
        this.authentication = authentication;
    }
    generate() {
        return null;
    }
    verify(requisition) {
        return [{
                name: 'Http authentication',
                description: `No supported http authentication method was found from: ${this.authentication}`,
                valid: false
            }];
    }
};
HttpNoAuthentication = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], HttpNoAuthentication);
exports.HttpNoAuthentication = HttpNoAuthentication;

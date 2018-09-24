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
let HttpBearerAuthentication = class HttpBearerAuthentication extends http_authentication_1.HttpAuthentication {
    constructor(authentication) {
        super();
        this.tests = [];
        this.token = authentication.bearer.token;
    }
    generate() {
        return { 'authorization': 'Bearer ' + this.token };
    }
    verify(authorization) {
        try {
            this.tests = [];
            const token = authorization.split(' ')[1];
            this.tests.push(this.authenticatePrefix(authorization.split(' ')[0]));
            this.tests.push(this.authenticateToken(token));
        }
        catch (err) {
            logger_1.Logger.error(`Error trying to authenticate: ${err}`);
        }
        this.tests.push(this.bearerAuthentication());
        return this.tests;
    }
    bearerAuthentication() {
        let test = {
            name: '"Bearer" authentication',
            valid: false,
            description: 'Fail to authenticate \'Bearer\' authentication'
        };
        if (this.tests.length > 0) {
            if (this.tests.every(test => test.valid)) {
                test.valid = true;
                test.description = `Bearer authentication is valid`;
            }
        }
        return test;
    }
    authenticatePrefix(prefix) {
        let test = {
            name: '"Bearer" authentication prefix',
            valid: false,
            description: `Prefix "Bearer" was not found in Bearer authentication. Got ${prefix} instead`
        };
        if (prefix == 'Bearer') {
            test.valid = true;
            test.description = `Prefix "Bearer" was found.`;
        }
        return test;
    }
    authenticateToken(token) {
        let test = {
            name: '"Bearer" authentication token',
            valid: false,
            description: `Token does not match. Got ${token} instead`
        };
        if (token == this.token) {
            test.valid = true;
            test.description = `Token match`;
        }
        return test;
    }
};
HttpBearerAuthentication = __decorate([
    conditional_injector_1.Injectable({ predicate: (authentication) => authentication.bearer && authentication.bearer.token }),
    __metadata("design:paramtypes", [Object])
], HttpBearerAuthentication);
exports.HttpBearerAuthentication = HttpBearerAuthentication;

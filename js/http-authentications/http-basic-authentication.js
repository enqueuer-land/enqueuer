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
const util_1 = require("util");
const logger_1 = require("../loggers/logger");
let HttpBasicAuthentication = class HttpBasicAuthentication extends http_authentication_1.HttpAuthentication {
    constructor(authentication) {
        super();
        this.tests = [];
        this.user = authentication.basic.user || '';
        this.password = authentication.basic.password;
    }
    generate() {
        return { 'authorization': 'Basic ' + Buffer.from(`${this.user}:${this.password}`, 'ascii').toString('base64') };
    }
    verify(authorization) {
        try {
            this.tests = [];
            const plainAuth = new Buffer(authorization.split(' ')[1], 'base64').toString(); //decode
            const credentials = plainAuth.split(':');
            this.tests.push(this.authenticatePrefix(authorization.split(' ')[0]));
            this.tests.push(this.authenticateUser(credentials[0]));
            this.tests.push(this.authenticatePassword(credentials[1]));
        }
        catch (err) {
            logger_1.Logger.error(`Error trying to authenticate: ${err}`);
        }
        this.tests.push(this.basicAuthentication());
        return this.tests;
    }
    basicAuthentication() {
        let test = {
            name: '"Basic" authentication',
            valid: false,
            description: 'Fail to authenticate \'Basic\' authentication'
        };
        if (this.tests.length > 0) {
            if (this.tests.every(test => test.valid)) {
                test.valid = true;
                test.description = `Basic authentication is valid`;
            }
        }
        return test;
    }
    authenticatePrefix(prefix) {
        let test = {
            name: '"Basic" authentication prefix',
            valid: false,
            description: `Prefix "Basic" was not found in Basic authentication. Got ${prefix} instead`
        };
        if (prefix == 'Basic') {
            test.valid = true;
            test.description = `Prefix "Basic" was found.`;
        }
        return test;
    }
    authenticateUser(user) {
        let test = {
            name: '"Basic" authentication user',
            valid: false,
            description: `User was not found. Got ${user} instead`
        };
        if (user == this.user) {
            test.valid = true;
            test.description = `User found`;
        }
        return test;
    }
    authenticatePassword(pass) {
        let test = {
            name: '"Basic" authentication password',
            valid: false,
            description: `Password does not match. Got ${pass} instead`
        };
        if (pass == this.password) {
            test.valid = true;
            test.description = `Password matchs`;
        }
        return test;
    }
};
HttpBasicAuthentication = __decorate([
    conditional_injector_1.Injectable({ predicate: (authentication) => !util_1.isNullOrUndefined(authentication.basic) }),
    __metadata("design:paramtypes", [Object])
], HttpBasicAuthentication);
exports.HttpBasicAuthentication = HttpBasicAuthentication;

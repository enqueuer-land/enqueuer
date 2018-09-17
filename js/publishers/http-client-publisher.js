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
const publisher_1 = require("./publisher");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const http_authentication_1 = require("../http-authentications/http-authentication");
const http_requester_1 = require("./http-requester");
let HttpClientPublisher = class HttpClientPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.url = publish.url;
        this.authentication = publish.authentication;
        this.method = publish.method.toUpperCase();
        this.payload = publish.payload || '';
        this.headers = publish.headers || {};
        this.timeout = publish.timeout || 3000;
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.insertAuthentication();
            new http_requester_1.HttpRequester(this.url, this.method.toLowerCase(), this.headers, this.payload, this.timeout)
                .request()
                .then((response) => {
                logger_1.Logger.trace(`Http/s requisition response: ${JSON.stringify(response)}`.substr(0, 128));
                this.messageReceived = response;
                resolve();
            })
                .catch(err => reject(err));
        });
    }
    insertAuthentication() {
        if (this.authentication) {
            const authenticator = conditional_injector_1.Container.subclassesOf(http_authentication_1.HttpAuthentication).create(this.authentication);
            const authentication = authenticator.generate();
            if (authentication) {
                this.headers = Object.assign(this.headers, authentication);
            }
            else {
                logger_1.Logger.warning(`No http authentication method was generated from: ${this.authentication}`);
            }
        }
    }
};
HttpClientPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'http-client' || publishRequisition.type === 'https-client' }),
    __metadata("design:paramtypes", [Object])
], HttpClientPublisher);
exports.HttpClientPublisher = HttpClientPublisher;

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const request_1 = __importDefault(require("request"));
const http_authentication_1 = require("../http-authentications/http-authentication");
let HttpClientPublisher = class HttpClientPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.url = publish.url;
        this.authentication = publish.authentication;
        this.method = publish.method.toUpperCase();
        this.payload = publish.payload || '';
        this.headers = publish.headers || {};
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.insertAuthentication();
            const options = this.createOptions();
            logger_1.Logger.trace(`Http-client-publisher ${JSON.stringify(options)}`);
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            request_1.default(options, (error, response) => {
                this.handleResponse(response);
                if (error) {
                    reject('Http request error: ' + error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    handleResponse(response) {
        if (response) {
            this.messageReceived = response;
            logger_1.Logger.trace(`Http requisition response: ${JSON.stringify(response)}`.substr(0, 128));
        }
        else {
            logger_1.Logger.warning(`No http requisition response`);
        }
    }
    createOptions() {
        let options = {
            url: this.url,
            method: this.method,
            headers: this.headers
        };
        options.data = options.body = this.handleObjectPayload();
        if (this.method.toUpperCase() != 'GET') {
            options.headers['Content-Length'] = options.headers['Content-Length'] || this.setContentLength(options.data);
        }
        return options;
    }
    setContentLength(value) {
        if (Buffer.isBuffer(value)) {
            return value.length;
        }
        else {
            return Buffer.from(value, 'utf8').byteLength;
        }
    }
    handleObjectPayload() {
        if (this.method.toUpperCase() == 'GET') {
            return this.payload;
        }
        try {
            const parsedPayload = JSON.parse(this.payload);
            if (typeof parsedPayload === 'object') {
                logger_1.Logger.trace(`Http payload is an object: ${this.payload}`);
            }
            return this.payload;
        }
        catch (exc) {
            //do nothing
        }
        if (typeof (this.payload) != 'string') {
            this.payload = JSON.stringify(this.payload);
        }
        return this.payload;
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

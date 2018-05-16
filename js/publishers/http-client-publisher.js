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
const request = require("request");
let HttpClientPublisher = class HttpClientPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.url = publish.url;
        this.method = publish.method.toUpperCase();
        this.payload = publish.payload || "";
        this.headers = publish.headers || {};
    }
    publish() {
        return new Promise((resolve, reject) => {
            let options = {
                url: this.url,
                method: this.method,
                headers: this.headers
            };
            options.data = options.body = this.handleObjectPayload(options);
            if (this.method.toUpperCase() != "GET")
                options.headers['Content-Length'] = options.headers["Content-Length"] || this.setContentLength(options.data);
            logger_1.Logger.trace(`Http-client-publisher ${JSON.stringify(options)}`);
            request(options, (error, response, body) => {
                if (response) {
                    this.messageReceived = JSON.stringify(response);
                    logger_1.Logger.trace(`Http requisition response: ${JSON.stringify(response).substr(0, 128)}...`);
                }
                else
                    logger_1.Logger.warning(`No http requisition response`);
                if (error) {
                    reject("Error firing http request: " + error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    setContentLength(value) {
        if (Buffer.isBuffer(value)) {
            return value.length;
        }
        else {
            return Buffer.from(value, "utf8").byteLength;
        }
    }
    handleObjectPayload(options) {
        let result = Object.assign({}, options);
        if (this.method.toUpperCase() != "GET") {
            try {
                const isObject = typeof JSON.parse(this.payload) === 'object';
                if (isObject) {
                    logger_1.Logger.trace(`Http payload is an object: ${this.payload}`);
                    result.json = true;
                }
            }
            catch (exc) { }
        }
        return JSON.stringify(this.payload);
    }
};
HttpClientPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === "http-client" }),
    __metadata("design:paramtypes", [Object])
], HttpClientPublisher);
exports.HttpClientPublisher = HttpClientPublisher;

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
const injector_1 = require("../injector/injector");
const logger_1 = require("../loggers/logger");
const request = require("request");
let HttpClientPublisher = class HttpClientPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.url = publish.url;
        this.method = publish.method;
        this.payload = JSON.stringify(publish.payload);
        this.headers = publish.headers;
        if (this.headers['Content-Length'] == null) {
            if (Buffer.isBuffer(this.payload)) {
                this.headers["Content-Length"] = this.payload.length;
            }
            else {
                this.headers["Content-Length"] = Buffer.byteLength(this.payload);
            }
        }
    }
    publish() {
        return new Promise((resolve, reject) => {
            logger_1.Logger.debug(`Http in ${this.url}(${this.method}) - ${this.payload}`
                .substr(0, 100).concat("..."));
            request({
                url: this.url,
                method: this.method,
                headers: this.headers,
                data: this.payload,
                body: this.payload
            }, (error, response, body) => {
                response.setEncoding(null);
                if (error) {
                    reject("Error to publish http: " + error);
                }
                else {
                    resolve();
                }
                logger_1.Logger.debug(`Http response ${JSON.stringify(response)}`);
                logger_1.Logger.debug(`Http body ${JSON.stringify(body)}`);
            });
        });
    }
};
HttpClientPublisher = __decorate([
    injector_1.Injectable((publishRequisition) => publishRequisition.type === "http-client"),
    __metadata("design:paramtypes", [Object])
], HttpClientPublisher);
exports.HttpClientPublisher = HttpClientPublisher;

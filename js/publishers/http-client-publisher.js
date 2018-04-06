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
const request = require("request");
let HttpClientPublisher = class HttpClientPublisher extends publisher_1.Publisher {
    constructor(publish) {
        super(publish);
        this.url = publish.url;
        this.method = publish.method;
        this.headers = publish.headers;
    }
    publish() {
        return new Promise((resolve, reject) => {
            request({
                url: this.url,
                method: this.method,
                headers: this.headers,
                body: this.payload
            }, (error, response, body) => {
                if (error) {
                    reject("Error to publish http: " + error);
                }
                else {
                    resolve();
                }
            });
        });
    }
};
HttpClientPublisher = __decorate([
    injector_1.Injectable((publishRequisition) => publishRequisition.type === "http-client"),
    __metadata("design:paramtypes", [Object])
], HttpClientPublisher);
exports.HttpClientPublisher = HttpClientPublisher;

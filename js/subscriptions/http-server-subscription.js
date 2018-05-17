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
const subscription_1 = require("./subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const util_1 = require("util");
const express = require('express');
let HttpServerSubscription = class HttpServerSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.response = {};
        this.app = express();
        this.app.use((req, res, next) => {
            req.setEncoding('utf8');
            req.rawBody = '';
            req.on('data', function (chunk) {
                req.rawBody += chunk;
            });
            req.on('end', function () {
                logger_1.Logger.trace(`Http subscription read ${req.rawBody}`);
                next();
            });
        });
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.method = subscriptionAttributes.method;
        this.response = subscriptionAttributes.response || {};
        this.response.status = this.response.status || 200;
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.app.all(this.endpoint, (request, response) => {
                const payload = JSON.parse(request.rawBody).toString();
                if (util_1.isNullOrUndefined(this.response.payload))
                    this.response.payload = `Requisition read: ${payload}`;
                for (const key in this.response.header) {
                    response.header(key, this.response.header[key]);
                }
                if (request.method != this.method)
                    response.status(405).send(`Http server is expecting a ${this.method} call`);
                else {
                    response.status(this.response.status).send(this.response.payload);
                    resolve(payload);
                }
            });
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }
    unsubscribe() {
        if (this.server) {
            this.server.close();
        }
        delete this.server;
    }
};
HttpServerSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === "http-server" }),
    __metadata("design:paramtypes", [Object])
], HttpServerSubscription);
exports.HttpServerSubscription = HttpServerSubscription;

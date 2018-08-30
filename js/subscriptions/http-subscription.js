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
const http_server_pool_1 = require("../pools/http-server-pool");
const http_authentication_1 = require("../http-authentications/http-authentication");
const http_requester_1 = require("../publishers/http-requester");
let HttpSubscription = class HttpSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.credentials = subscriptionAttributes.credentials;
        this.authentication = subscriptionAttributes.authentication;
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.redirect = subscriptionAttributes.redirect;
        this.secureServer = this.isSecureServer();
        this.proxy = this.isProxyServer();
        this.method = subscriptionAttributes.method.toLowerCase();
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            http_server_pool_1.HttpServerPool.getInstance().getApp(this.port, this.secureServer, this.credentials)
                .then((app) => {
                this.expressApp = app;
                resolve();
            }).catch(err => {
                logger_1.Logger.error(`Error in ${this.type} subscription`);
                reject(err);
            });
        });
    }
    unsubscribe() {
        http_server_pool_1.HttpServerPool.getInstance().releaseApp(this.port);
    }
    sendResponse() {
        logger_1.Logger.trace(`${this.type} sending response: ${JSON.stringify(this.response, null, 2)}`);
        try {
            this.responseToClientHandler.status(this.response.status).send(this.response.payload);
            logger_1.Logger.debug(`${this.type} response sent`);
            return Promise.resolve();
        }
        catch (err) {
            return Promise.reject(`${this.type} response back sending error: ${err}`);
        }
    }
    onMessageReceivedTests() {
        if (this.authentication && this.messageReceived) {
            logger_1.Logger.debug(`${this.type} authenticating message with ${JSON.stringify(Object.keys(this.authentication))}`);
            const verifier = conditional_injector_1.Container.subclassesOf(http_authentication_1.HttpAuthentication).create(this.authentication);
            return verifier.verify(this.messageReceived.headers.authorization);
        }
        return [];
    }
    receiveMessage() {
        if (this.proxy) {
            return this.proxyServerMessageReceiving();
        }
        else {
            return this.realServerMessageReceiving();
        }
    }
    realServerMessageReceiving() {
        return new Promise((resolve) => {
            this.expressApp[this.method](this.endpoint, (request, responseHandler, next) => {
                logger_1.Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${request.rawBody}`);
                this.responseToClientHandler = responseHandler;
                resolve(this.createMessageReceivedStructure(request));
                next();
            });
        });
    }
    proxyServerMessageReceiving() {
        return new Promise((resolve, reject) => {
            this.expressApp[this.method](this.endpoint, (request, responseHandler, next) => {
                this.responseToClientHandler = responseHandler;
                logger_1.Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${request.rawBody}`);
                this.redirectCall(request)
                    .then((redirectionResponse) => {
                    logger_1.Logger.trace(`${this.type}:${this.port} got redirection response: ${JSON.stringify(redirectionResponse, null, 2)}`);
                    this.response = {
                        status: redirectionResponse.statusCode,
                        payload: redirectionResponse.body,
                    };
                    resolve(this.createMessageReceivedStructure(request));
                    next();
                })
                    .catch(err => {
                    reject(err);
                    next();
                });
            });
        });
    }
    createMessageReceivedStructure(message) {
        return {
            headers: message.headers,
            params: message.params,
            query: message.query,
            body: message.rawBody
        };
    }
    redirectCall(originalRequisition) {
        const url = this.redirect + originalRequisition.url;
        logger_1.Logger.info(`Redirecting call from ${this.endpoint} (${this.port}) to ${url}`);
        return new Promise((resolve, reject) => {
            new http_requester_1.HttpRequester(url, this.method.toLowerCase(), originalRequisition.headers, originalRequisition.rawBody)
                .request()
                .then((response) => resolve(response))
                .catch(err => reject(err));
        });
    }
    isSecureServer() {
        if (this.type) {
            if (this.type.indexOf('https') != -1) {
                return true;
            }
            else if (this.type.indexOf('http') != -1) {
                return false;
            }
        }
        throw `Http server type is not known: ${this.type}`;
    }
    isProxyServer() {
        if (this.type) {
            return this.type.indexOf('proxy') != -1;
        }
        throw `Http server type is not known: ${this.type}`;
    }
};
HttpSubscription = __decorate([
    conditional_injector_1.Injectable({
        predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'http-proxy' ||
            subscriptionAttributes.type === 'https-proxy' ||
            subscriptionAttributes.type === 'http-server' ||
            subscriptionAttributes.type === 'https-server'
    }),
    __metadata("design:paramtypes", [Object])
], HttpSubscription);
exports.HttpSubscription = HttpSubscription;

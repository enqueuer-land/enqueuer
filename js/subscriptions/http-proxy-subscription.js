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
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const http_server_pool_1 = require("../pools/http-server-pool");
const http_authentication_1 = require("../http-authentications/http-authentication");
const request_1 = __importDefault(require("request"));
let HttpProxySubscription = class HttpProxySubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.credentials = subscriptionAttributes.credentials;
        this.authentication = subscriptionAttributes.authentication;
        this.port = subscriptionAttributes.port;
        this.endpoint = subscriptionAttributes.endpoint;
        this.redirect = subscriptionAttributes.redirect;
        this.secureServer = this.isSecureServer();
        this.method = subscriptionAttributes.method.toLowerCase();
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.app[this.method](this.endpoint, (request, response, next) => {
                const payload = request.rawBody;
                logger_1.Logger.debug(`${this.type}:${this.port} got hit (${request.method}) ${this.endpoint}: ${payload}`);
                let headers = {};
                Object.keys(request.headers)
                    .forEach((header) => headers[header] = request.headers[header]);
                this.responseHandler = response;
                const messageReceived = {
                    headers,
                    params: request.params,
                    query: request.query,
                    body: payload
                };
                this.redirectCall(request)
                    .then(() => {
                    resolve(messageReceived);
                    next();
                })
                    .catch(err => {
                    reject(err);
                    next();
                });
            });
        });
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            if (this.secureServer) {
                http_server_pool_1.HttpServerPool.getInstance().getHttpsServer(this.credentials, this.port)
                    .then((app) => {
                    this.app = app;
                    resolve();
                }).catch(err => reject(err));
            }
            else {
                http_server_pool_1.HttpServerPool.getInstance().getHttpServer(this.port)
                    .then((app) => {
                    this.app = app;
                    resolve();
                }).catch(err => reject(err));
            }
        });
    }
    unsubscribe() {
        http_server_pool_1.HttpServerPool.getInstance().closeServer(this.port);
    }
    sendResponse() {
        return new Promise((resolve, reject) => {
            if (this.responseHandler) {
                try {
                    logger_1.Logger.debug(`${this.type} sending response`);
                    this.responseHandler.status(this.response.status).send(this.response.payload);
                    logger_1.Logger.trace(`${this.type} response sent`);
                    resolve();
                }
                catch (err) {
                    throw `${this.type} response back sending error: ${err}`;
                }
            }
            else {
                reject(`No ${this.type} response handler found`);
            }
        });
    }
    onMessageReceivedTests() {
        if (this.authentication && this.messageReceived) {
            logger_1.Logger.debug(`${this.type} authenticating message with ${JSON.stringify(Object.keys(this.authentication))}`);
            const verifier = conditional_injector_1.Container.subclassesOf(http_authentication_1.HttpAuthentication).create(this.authentication);
            return verifier.verify(this.messageReceived.headers.authorization);
        }
        return [];
    }
    redirectCall(originalRequisition) {
        return new Promise((resolve, reject) => {
            try {
                const options = this.createOptions(originalRequisition);
                logger_1.Logger.info(`Redirecting call from ${this.endpoint} (${this.port}) to ${options.url}`);
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                request_1.default(options, (error, response, body) => {
                    if (error) {
                        logger_1.Logger.error('Error redirecting call: ' + error);
                        return reject(error);
                    }
                    this.response = {
                        payload: body,
                        status: response.statusCode
                    };
                    resolve();
                });
            }
            catch (err) {
                logger_1.Logger.error(`Error redirecting call to ${this.redirect}`);
                reject(err);
            }
        });
    }
    createOptions(originalRequisition) {
        let options = {
            method: this.method.toLowerCase(),
            url: this.redirect + originalRequisition.url,
            headers: originalRequisition.headers
        };
        options.data = options.body = originalRequisition.rawBody;
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
};
HttpProxySubscription = __decorate([
    conditional_injector_1.Injectable({
        predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'http-proxy'
            || subscriptionAttributes.type === 'https-proxy'
    }),
    __metadata("design:paramtypes", [Object])
], HttpProxySubscription);
exports.HttpProxySubscription = HttpProxySubscription;

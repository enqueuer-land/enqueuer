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
const logger_1 = require("../../loggers/logger");
const daemon_input_1 = require("./daemon-input");
const http_container_pool_1 = require("../../pools/http-container-pool");
const javascript_object_notation_1 = require("../../object-notations/javascript-object-notation");
let HttpDaemonInput = class HttpDaemonInput extends daemon_input_1.DaemonInput {
    constructor(daemonInput) {
        super();
        this.type = daemonInput.type;
        this.port = daemonInput.port || 23023;
        this.endpoint = daemonInput.endpoint || '/requisitions';
        this.method = daemonInput.method || 'post';
    }
    subscribe(onMessageReceived) {
        http_container_pool_1.HttpContainerPool.getApp(this.port)
            .then((app) => {
            logger_1.Logger.info(`Waiting for HTTP requisitions: (${this.method.toUpperCase()}) - http://localhost:${this.port}${this.endpoint}`);
            app[this.method](this.endpoint, (request, responseHandler) => {
                logger_1.Logger.debug(`HttpDaemonInput:${this.port} got message (${this.method}) ${this.endpoint}: ${request.rawBody}`);
                let result = {
                    type: this.type,
                    daemon: this,
                    input: request.rawBody,
                    responseHandler: responseHandler
                };
                onMessageReceived(result);
            });
        }).catch(err => {
            const message = `Error in HttpDaemonInput subscription: ${err}`;
            logger_1.Logger.error(message);
            throw message;
        });
    }
    unsubscribe() {
        return http_container_pool_1.HttpContainerPool.releaseApp(this.port);
    }
    cleanUp(requisition) {
        return Promise.resolve();
    }
    sendResponse(message) {
        const response = {
            status: 200,
            payload: message.output
        };
        logger_1.Logger.trace(`${this.type} sending requisition response: ${new javascript_object_notation_1.JavascriptObjectNotation().stringify(response)}`);
        try {
            message.responseHandler.status(response.status).send(response.payload);
            logger_1.Logger.debug(`${this.type} requisition response sent`);
            return Promise.resolve();
        }
        catch (err) {
            return Promise.reject(`${this.type} response back sending error: ${err}`);
        }
    }
};
HttpDaemonInput = __decorate([
    conditional_injector_1.Injectable({ predicate: (daemonInput) => daemonInput.type === 'http-server' }),
    __metadata("design:paramtypes", [Object])
], HttpDaemonInput);
exports.HttpDaemonInput = HttpDaemonInput;

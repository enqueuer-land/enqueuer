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
const requisition_parser_1 = require("../../runners/requisition-parser");
let HttpDaemonInput = class HttpDaemonInput extends daemon_input_1.DaemonInput {
    constructor(daemonInput) {
        super();
        logger_1.Logger.trace(`Instantiating HttpDaemonInputAdapter`);
        this.type = daemonInput.type;
        this.port = daemonInput.port || 23023;
        this.endpoint = daemonInput.endpoint || '/requisitions';
        this.method = daemonInput.method || 'post';
        this.parser = new requisition_parser_1.RequisitionParser();
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            http_container_pool_1.HttpContainerPool.getApp(this.port)
                .then((app) => {
                this.registerMessageEvent(app);
                resolve();
            }).catch(err => {
                const message = `Error in HttpDaemonInput subscription: ${err}`;
                logger_1.Logger.error(message);
                reject(message);
            });
        });
    }
    receiveMessage() {
        return new Promise((resolve) => this.messageReceiverResolver = resolve);
    }
    unsubscribe() {
        http_container_pool_1.HttpContainerPool.releaseApp(this.port);
        return Promise.resolve();
    }
    cleanUp() {
        this.messageReceiverResolver = null;
        return Promise.resolve();
    }
    sendResponse(message) {
        const response = {
            status: 200,
            payload: message.output
        };
        logger_1.Logger.trace(`${this.type} sending requisition response: ${JSON.stringify(response, null, 2)}`);
        try {
            message.responseHandler.status(response.status).send(response.payload);
            logger_1.Logger.debug(`${this.type} requisition response sent`);
            return Promise.resolve();
        }
        catch (err) {
            return Promise.reject(`${this.type} response back sending error: ${err}`);
        }
    }
    registerMessageEvent(app) {
        app[this.method](this.endpoint, (request, responseHandler) => {
            logger_1.Logger.debug(`HttpDaemonInput:${this.port} got message (${this.method}) ${this.endpoint}: ${request.rawBody}`);
            let result = {
                type: this.type,
                daemon: this,
                input: this.parser.parse(request.rawBody),
                responseHandler: responseHandler
            };
            if (this.messageReceiverResolver) {
                this.messageReceiverResolver(result);
            }
            else {
                logger_1.Logger.warning(`No ${this.type} messageReceiver resolver to handle message`);
            }
        });
    }
};
HttpDaemonInput = __decorate([
    conditional_injector_1.Injectable({ predicate: (daemonInput) => daemonInput.type === 'http-server' }),
    __metadata("design:paramtypes", [Object])
], HttpDaemonInput);
exports.HttpDaemonInput = HttpDaemonInput;

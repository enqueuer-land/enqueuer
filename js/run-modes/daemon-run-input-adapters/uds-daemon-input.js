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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../../loggers/logger");
const daemon_input_1 = require("./daemon-input");
const handler_listener_1 = require("../../handlers/handler-listener");
const net = __importStar(require("net"));
const fs = __importStar(require("fs"));
const requisition_parser_1 = require("../../requisition-runners/requisition-parser");
let UdsDaemonInput = class UdsDaemonInput extends daemon_input_1.DaemonInput {
    constructor(daemonInput) {
        super();
        this.type = daemonInput.type;
        this.path = daemonInput.path;
        this.parser = new requisition_parser_1.RequisitionParser();
        logger_1.Logger.trace(`Instantiating UdsDaemonInput`);
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            fs.unlink(this.path, () => {
                this.server = net.createServer();
                new handler_listener_1.HandlerListener(this.server)
                    .listen(this.path)
                    .then(() => {
                    logger_1.Logger.debug(`Uds server is listening for uds clients on ${this.path}`);
                    resolve();
                })
                    .catch(err => {
                    const message = `Uds server could not listen to ${this.path}: ${err}`;
                    logger_1.Logger.error(message);
                    reject(message);
                });
            });
        });
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.on('connection', (stream) => {
                    stream.on('data', (msg) => {
                        logger_1.Logger.debug(`Uds server got data`);
                        let result = {
                            type: this.type,
                            daemon: this,
                            input: this.parser.parse(this.adapt(msg)),
                            stream: stream
                        };
                        resolve(result);
                    });
                });
            }
            else {
                reject(`No Uds daemon server found able to receive message`);
            }
        });
    }
    unsubscribe() {
        if (this.server) {
            this.server.close();
            delete this.server;
        }
        return Promise.resolve();
    }
    cleanUp() {
        return Promise.resolve();
    }
    sendResponse(message) {
        return new Promise((resolve, reject) => {
            if (message.stream) {
                logger_1.Logger.debug(`Uds daemon server sending response`);
                const response = this.stringifyPayloadToSend(message.output);
                message.stream.write(response, () => {
                    logger_1.Logger.debug(`Uds daemon server response sent`);
                    message.stream.end();
                    message.stream = null;
                    resolve();
                });
            }
            else {
                const message = `No uds daemon response was sent because uds stream is null`;
                logger_1.Logger.warning(message);
                reject(message);
            }
        });
    }
    adapt(message) {
        const payload = message.payload;
        let stringify;
        if (payload) {
            stringify = this.stringifyPayloadReceived(payload);
        }
        else {
            stringify = this.stringifyPayloadReceived(message);
        }
        if (stringify) {
            return stringify;
        }
        throw 'Uds daemon input can not adapt received message';
    }
    stringifyPayloadReceived(message) {
        const messageType = typeof (message);
        if (messageType == 'string') {
            return message;
        }
        else if (Buffer.isBuffer(message)) {
            return Buffer.from(message).toString();
        }
    }
    stringifyPayloadToSend(payload) {
        if (typeof (payload) != 'string' && !Buffer.isBuffer(payload)) {
            return JSON.stringify(payload);
        }
        return payload;
    }
};
UdsDaemonInput = __decorate([
    conditional_injector_1.Injectable({ predicate: (daemonInput) => daemonInput.type == 'uds' }),
    __metadata("design:paramtypes", [Object])
], UdsDaemonInput);
exports.UdsDaemonInput = UdsDaemonInput;

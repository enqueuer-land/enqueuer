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
const stream_daemon_input_1 = require("./stream-daemon-input");
//TODO test it
let TcpDaemonInput = class TcpDaemonInput extends daemon_input_1.DaemonInput {
    constructor(daemonInput) {
        super();
        this.type = daemonInput.type;
        this.port = daemonInput.port || 23022;
        this.streamDaemon = new stream_daemon_input_1.StreamDaemonInput(this.port);
    }
    subscribe() {
        return this.streamDaemon.subscribe()
            .then(() => logger_1.Logger.info(`Waiting for TCP requisitions: ${this.port}`));
    }
    receiveMessage() {
        return this.streamDaemon.receiveMessage()
            .then((requisition) => {
            logger_1.Logger.debug(`TCP server got data`);
            requisition.type = this.type;
            requisition.daemon = this;
            return requisition;
        });
    }
    unsubscribe() {
        return this.streamDaemon.unsubscribe();
    }
    cleanUp() {
        return this.streamDaemon.cleanUp();
    }
    sendResponse(message) {
        return this.streamDaemon.sendResponse(message)
            .then(() => logger_1.Logger.debug(`TCP daemon server response sent`));
    }
};
TcpDaemonInput = __decorate([
    conditional_injector_1.Injectable({ predicate: (daemonInput) => daemonInput.type == 'tcp' }),
    __metadata("design:paramtypes", [Object])
], TcpDaemonInput);
exports.TcpDaemonInput = TcpDaemonInput;

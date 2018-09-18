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
let NullDaemonInput = class NullDaemonInput extends daemon_input_1.DaemonInput {
    constructor(daemonInput) {
        super();
        logger_1.Logger.warning(`Instantiating unknown daemon input from "${JSON.stringify(daemonInput)}`);
        this.daemonInput = daemonInput;
    }
    subscribe() {
        return Promise.reject(`Impossible to subscribe to an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }
    receiveMessage() {
        return Promise.reject(`Impossible to receive message from an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }
    unsubscribe() {
        return Promise.reject(`Impossible to unsubscribe to an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }
    cleanUp() {
        return Promise.reject(`Impossible to clean up an unknown daemon input: ${JSON.stringify(this.daemonInput)}`);
    }
};
NullDaemonInput = __decorate([
    conditional_injector_1.Injectable(),
    __metadata("design:paramtypes", [Object])
], NullDaemonInput);
exports.NullDaemonInput = NullDaemonInput;

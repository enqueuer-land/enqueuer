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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../../loggers/logger");
const daemon_input_1 = require("./daemon-input");
const stream_input_handler_1 = require("../../handlers/stream-input-handler");
let UdsDaemonInput = class UdsDaemonInput extends daemon_input_1.DaemonInput {
    constructor(daemonInput) {
        super();
        this.type = daemonInput.type;
        this.path = daemonInput.path || '/tmp/enqueuer.requisitions';
        this.streamHandler = new stream_input_handler_1.StreamInputHandler(this.path);
    }
    subscribe(onMessageReceived) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.streamHandler.subscribe((data) => {
                logger_1.Logger.debug(`UDS daemon server got data`);
                onMessageReceived({
                    type: this.type,
                    daemon: this,
                    input: data.message,
                    stream: data.stream
                });
            });
            logger_1.Logger.info(`Waiting for UDS requisitions: ${this.path}`);
        });
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.debug(`Releasing ${this.path} server`);
            yield this.streamHandler.unsubscribe();
        });
    }
    cleanUp(requisition) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.streamHandler.close(requisition.stream);
        });
    }
    sendResponse(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.streamHandler.sendResponse(message.stream, message.output);
            logger_1.Logger.debug(`UDS daemon server response sent`);
        });
    }
};
UdsDaemonInput = __decorate([
    conditional_injector_1.Injectable({ predicate: (daemonInput) => daemonInput.type == 'uds' }),
    __metadata("design:paramtypes", [Object])
], UdsDaemonInput);
exports.UdsDaemonInput = UdsDaemonInput;

"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_listener_1 = require("../../handlers/handler-listener");
const net = __importStar(require("net"));
const requisition_parser_1 = require("../../requisition-runners/requisition-parser");
//TODO test it
class StreamDaemonInput {
    constructor(handler) {
        this.handler = handler;
        this.parser = new requisition_parser_1.RequisitionParser();
        this.server = net.createServer();
    }
    subscribe() {
        return new handler_listener_1.HandlerListener(this.server).listen(this.handler);
    }
    receiveMessage() {
        return new Promise((resolve) => {
            this.server.on('connection', (stream) => {
                stream.on('data', (msg) => {
                    resolve({
                        type: 'stream',
                        input: this.parser.parse(this.adapt(msg)),
                        stream: stream
                    });
                });
            });
        });
    }
    unsubscribe() {
        this.server.close();
        delete this.server;
        return Promise.resolve();
    }
    cleanUp() {
        return Promise.resolve();
    }
    sendResponse(message) {
        return new Promise((resolve, reject) => {
            if (message.stream) {
                const response = this.stringifyPayloadToSend(message.output);
                message.stream.write(response, () => {
                    message.stream.end();
                    message.stream = null;
                    resolve();
                });
            }
            else {
                const message = `No daemon response was sent because stream is null`;
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
        throw 'Daemon input can not adapt received message';
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
}
exports.StreamDaemonInput = StreamDaemonInput;

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
const javascript_object_notation_1 = require("../../object-notations/javascript-object-notation");
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
                        input: this.parser.parse(this.stringifyPayloadReceived(msg.payload || msg)),
                        stream: stream
                    });
                });
            });
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
    sendResponse(requisition) {
        return new Promise((resolve, reject) => {
            if (requisition.stream) {
                const message = this.stringifyPayloadToSend(requisition.output);
                requisition.stream.write(message, () => {
                    requisition.stream.end();
                    requisition.stream = null;
                    resolve();
                });
            }
            else {
                const message = `No daemon response was sent because stream is null`;
                reject(message);
            }
        });
    }
    stringifyPayloadReceived(message) {
        const messageType = typeof (message);
        if (messageType == 'string') {
            return message;
        }
        return Buffer.from(message).toString();
    }
    stringifyPayloadToSend(payload) {
        if (typeof (payload) == 'string' || Buffer.isBuffer(payload)) {
            return payload;
        }
        return new javascript_object_notation_1.JavascriptObjectNotation().stringify(payload);
    }
}
exports.StreamDaemonInput = StreamDaemonInput;

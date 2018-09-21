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
const javascript_object_notation_1 = require("../../object-notations/javascript-object-notation");
//TODO test it
class StreamDaemonInput {
    constructor(handler) {
        this.handler = handler;
        this.server = net.createServer();
    }
    subscribe() {
        return new handler_listener_1.HandlerListener(this.server).listen(this.handler);
    }
    receiveMessage() {
        return new Promise((resolve) => {
            this.server.on('connection', (stream) => {
                this.stream = stream;
                stream.on('data', (msg) => resolve(this.stringifyPayloadReceived(msg.payload || msg)));
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
    sendResponse(message) {
        return new Promise((resolve) => {
            const strMsg = this.stringifyPayloadToSend(message);
            this.stream.write(strMsg, () => {
                this.stream.end();
                this.stream = null;
                resolve();
            });
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

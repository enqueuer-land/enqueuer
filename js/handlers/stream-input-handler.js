"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const handler_listener_1 = require("./handler-listener");
const net = __importStar(require("net"));
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
class StreamInputHandler {
    constructor(handler) {
        this.server = net.createServer();
        this.handler = handler;
        this.handlerListener = new handler_listener_1.HandlerListener(this.server);
    }
    subscribe(onMessageReceived) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.handlerListener.listen(this.handler)
                .then(() => {
                this.handler = this.handlerListener.getHandler();
                this.server.on('connection', (stream) => {
                    stream.on('data', (msg) => onMessageReceived({
                        message: this.stringifyPayloadReceived(msg.payload || msg),
                        stream: stream
                    }));
                });
            });
        });
    }
    getHandler() {
        return this.handler;
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.server) {
                this.server.close();
                delete this.server;
            }
        });
    }
    sendResponse(stream, message) {
        return new Promise((resolve, reject) => {
            const strMsg = this.stringifyPayloadToSend(message);
            try {
                stream.write(strMsg, () => resolve());
            }
            catch (err) {
                reject(`Error sending input handler: ${err}`);
            }
        });
    }
    close(stream) {
        stream.end();
        stream = null;
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
exports.StreamInputHandler = StreamInputHandler;

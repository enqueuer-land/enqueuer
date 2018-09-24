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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const conditional_injector_1 = require("conditional-injector");
const net = __importStar(require("net"));
const logger_1 = require("../loggers/logger");
const store_1 = require("../configurations/store");
const handler_listener_1 = require("../handlers/handler-listener");
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
let TcpServerSubscription = class TcpServerSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = new javascript_object_notation_1.JavascriptObjectNotation().stringify(subscriptionAttributes.response);
        }
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            if (this.loadStream) {
                this.waitForData(reject, resolve);
            }
            else {
                this.server.once('connection', (stream) => {
                    logger_1.Logger.debug(`Tcp server got a connection`);
                    this.stream = stream;
                    this.sendGreeting();
                    this.waitForData(reject, resolve);
                    this.server.close();
                    this.server = null;
                });
            }
        });
    }
    subscribe() {
        if (this.loadStream) {
            return this.reuseServer();
        }
        else {
            return this.createServer();
        }
    }
    unsubscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.server) {
                this.server.close();
                this.server = null;
            }
        });
    }
    sendResponse() {
        return new Promise((resolve) => {
            if (this.stream) {
                logger_1.Logger.debug(`Tcp server (${this.stream.localPort}) sending response`);
                this.stream.write(this.response, () => {
                    this.persistStream();
                    resolve();
                });
            }
        });
    }
    reuseServer() {
        return new Promise((resolve, reject) => {
            try {
                this.tryToLoadStream();
                logger_1.Logger.debug(`Tcp server is reusing tcp stream running on ${this.stream.localPort}`);
                resolve();
            }
            catch (err) {
                logger_1.Logger.error(err);
                this.createServer()
                    .then(() => resolve())
                    .catch((err) => reject(err));
            }
        });
    }
    createServer() {
        return new Promise((resolve, reject) => {
            this.server = net.createServer();
            new handler_listener_1.HandlerListener(this.server).listen(this.port)
                .then(() => {
                logger_1.Logger.debug(`Tcp server is listening for tcp clients on ${this.port}`);
                resolve();
            })
                .catch(err => {
                const message = `Tcp server could not listen to port ${this.port}: ${err}`;
                logger_1.Logger.error(message);
                reject(message);
            });
        });
    }
    sendGreeting() {
        if (this.greeting) {
            logger_1.Logger.debug(`Tcp server (${this.stream.localPort}) sending greeting message`);
            this.stream.write(this.greeting);
        }
    }
    tryToLoadStream() {
        logger_1.Logger.debug(`Server is loading tcp stream: ${this.loadStream}`);
        this.stream = store_1.Store.getData()[this.loadStream];
        if (this.stream) {
            logger_1.Logger.debug(`Server loaded tcp stream: ${this.loadStream} (${this.stream.localPort})`);
        }
        else {
            throw `Impossible to load tcp stream: ${this.loadStream}`;
        }
    }
    waitForData(reject, resolve) {
        logger_1.Logger.trace(`Tcp server (${this.stream.localPort}) is waiting on data`);
        this.stream.once('end', () => {
            const message = `Tcp server detected 'end' event`;
            logger_1.Logger.debug(message);
            reject(message);
        });
        this.stream.once('data', (msg) => {
            logger_1.Logger.debug(`Tcp server (${this.stream.localPort}) got data ${msg}`);
            resolve({ payload: msg, stream: this.stream.address() });
        });
    }
    persistStream() {
        if (this.saveStream) {
            logger_1.Logger.debug(`Persisting subscription tcp stream ${this.saveStream} (${this.stream.localPort})`);
            store_1.Store.getData()[this.saveStream] = this.stream;
            this.saveStream = undefined;
        }
        else {
            logger_1.Logger.trace(`Ending TCP stream (${this.stream.localPort})`);
            this.stream.end();
        }
    }
};
TcpServerSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'tcp' || subscriptionAttributes.type === 'tcp-server' }),
    __metadata("design:paramtypes", [Object])
], TcpServerSubscription);
exports.TcpServerSubscription = TcpServerSubscription;

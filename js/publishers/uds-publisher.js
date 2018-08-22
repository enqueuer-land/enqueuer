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
const publisher_1 = require("./publisher");
const net = __importStar(require("net"));
const conditional_injector_1 = require("conditional-injector");
const store_1 = require("../configurations/store");
const logger_1 = require("../loggers/logger");
let UdsPublisher = class UdsPublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        if (typeof (this.payload) != 'string' && !Buffer.isBuffer(this.payload)) {
            this.payload = JSON.stringify(this.payload);
        }
        this.path = publisherAttributes.path;
        this.loadStream = publisherAttributes.loadStream;
        this.saveStream = publisherAttributes.saveStream;
    }
    publish() {
        return new Promise((resolve, reject) => {
            this.stream = this.getStream();
            this.stream.setTimeout(1000);
            this.stream.on('timeout', () => {
                this.persistStream();
                resolve(this.messageReceived);
            }).once('error', (data) => {
                reject(data);
            })
                .once('end', () => {
                logger_1.Logger.trace(`Uds publisher detected stream end`);
                this.persistStream();
                resolve();
            })
                .once('data', (msg) => {
                logger_1.Logger.debug(`Uds publisher got message`);
                if (this.messageReceived === null || this.messageReceived === undefined) {
                    this.messageReceived = msg;
                }
                else {
                    this.messageReceived = this.messageReceived.concat(msg);
                }
            });
            this.stream.write(this.payload, () => logger_1.Logger.trace(`Uds publisher message sent: ${this.payload}`));
        });
    }
    getStream() {
        if (this.loadStream) {
            const storedStream = store_1.Store.getData()[this.loadStream];
            if (!storedStream) {
                throw new Error(`There is no uds stream able to be loaded named ${this.loadStream}`);
            }
            logger_1.Logger.debug(`Uds publisher is reusing stream: ${this.loadStream}`);
            return storedStream;
        }
        else {
            return net.createConnection(this.path);
        }
    }
    persistStream() {
        if (this.stream) {
            this.stream.removeAllListeners('data');
            this.stream.removeAllListeners('connect');
            this.stream.removeAllListeners('error');
            this.stream.removeAllListeners('end');
            if (this.saveStream) {
                store_1.Store.getData()[this.saveStream] = this.stream;
                logger_1.Logger.debug(`Uds publisher saved stream`);
            }
            else {
                this.stream.end();
            }
        }
        this.stream = null;
    }
};
UdsPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'uds' }),
    __metadata("design:paramtypes", [Object])
], UdsPublisher);
exports.UdsPublisher = UdsPublisher;

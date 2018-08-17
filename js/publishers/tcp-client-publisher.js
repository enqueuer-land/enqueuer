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
}
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const net = __importStar(require("net"));
const conditional_injector_1 = require("conditional-injector");
const logger_1 = require("../loggers/logger");
const util_1 = require("util");
const store_1 = require("../testers/store");
let TcpClientPublisher = class TcpClientPublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        this.serverAddress = publisherAttributes.serverAddress;
        this.port = publisherAttributes.port;
        this.saveStream = publisherAttributes.saveStream;
        this.loadStream = publisherAttributes.loadStream;
        this.timeout = publisherAttributes.timeout || 100;
        if (publisherAttributes.loadStream) {
            logger_1.Logger.debug(`Loading tcp client: ${this.loadStream}`);
            this.loadedStream = store_1.Store.getData()[publisherAttributes.loadStream];
        }
    }
    publish() {
        return new Promise((resolve, reject) => {
            if (this.loadStream) {
                logger_1.Logger.debug('Client is trying to reuse tcp stream');
                if (!this.loadedStream) {
                    return new Error(`There is no tcp stream able to be loaded named ${this.loadStream}`);
                }
                logger_1.Logger.debug('Client is reusing tcp stream');
                this.publishData(this.loadedStream, resolve, reject);
            }
            else {
                const stream = new net.Socket();
                logger_1.Logger.debug('Tcp client trying to connect');
                stream.connect(this.port, this.serverAddress, () => {
                    logger_1.Logger.debug(`Tcp client connected to: ${this.serverAddress}:${this.port}`);
                    this.publishData(stream, resolve, reject);
                });
            }
        });
    }
    publishData(stream, resolve, reject) {
        logger_1.Logger.debug(`Tcp client publishing`);
        stream.setTimeout(this.timeout);
        stream.on('timeout', () => {
            this.finalize(stream);
            stream.removeAllListeners('data');
            resolve(this.messageReceived);
        })
            .once('error', (data) => {
            this.finalize(stream);
            reject(data);
        })
            .once('end', () => {
            this.finalize(stream);
            resolve();
        })
            .on('data', (msg) => {
            logger_1.Logger.debug(`Tcp client got data '${msg.toString()}'`);
            if (util_1.isNullOrUndefined(this.messageReceived)) {
                this.messageReceived = '';
            }
            this.messageReceived += msg.toString();
        });
        this.write(stream);
    }
    write(stream) {
        stream.write(this.payload, () => {
            if (this.saveStream) {
                logger_1.Logger.debug(`Persisting publisher stream ${this.saveStream}`);
                store_1.Store.getData()[this.saveStream] = stream;
            }
        });
    }
    finalize(stream) {
        if (!this.saveStream) {
            stream.end();
        }
    }
};
TcpClientPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'tcp-client' }),
    __metadata("design:paramtypes", [Object])
], TcpClientPublisher);
exports.TcpClientPublisher = TcpClientPublisher;

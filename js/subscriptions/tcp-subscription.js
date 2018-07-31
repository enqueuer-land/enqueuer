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
const subscription_1 = require("./subscription");
const conditional_injector_1 = require("conditional-injector");
const net = __importStar(require("net"));
const variables_controller_1 = require("../variables/variables-controller");
const logger_1 = require("../loggers/logger");
let TcpSubscription = class TcpSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        this.persistStreamName = subscriptionAttributes.persistStreamName;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
        else {
            this.response = subscriptionAttributes.response;
        }
        this.loadStreamName = subscriptionAttributes.loadStreamName;
        if (subscriptionAttributes.loadStreamName) {
            logger_1.Logger.debug(`Loading tcp client: ${this.loadStreamName}`);
            this.loadStream = variables_controller_1.VariablesController.sessionVariables()[subscriptionAttributes.loadStreamName];
        }
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            if (this.loadStreamName) {
                if (!this.loadStream) {
                    reject(`There is no tcp stream able to be loaded named ${this.loadStreamName}`);
                    return;
                }
                this.waitForData(this.loadStream, reject, resolve);
            }
            else {
                this.server.on('connection', (stream) => {
                    this.waitForData(stream, reject, resolve);
                });
            }
        });
    }
    waitForData(stream, reject, resolve) {
        stream.on('end', () => {
            reject();
        });
        stream.on('data', (msg) => {
            if (this.response) {
                stream.write(this.response, () => {
                    this.persistStream(stream);
                    resolve(msg.toString());
                });
            }
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            if (this.loadStreamName) {
                if (!this.loadStream) {
                    reject(`There is no tcp stream able to be loaded named ${this.loadStreamName}`);
                }
                resolve();
                return;
            }
            this.server = net.createServer()
                .listen(this.port, 'localhost', () => {
                resolve();
            });
        });
    }
    unsubscribe() {
        if (this.server) {
            this.server.close();
        }
    }
    persistStream(stream) {
        if (this.persistStreamName) {
            logger_1.Logger.debug(`Persisting subscription stream ${this.persistStreamName}`);
            variables_controller_1.VariablesController.sessionVariables()[this.persistStreamName] = stream;
        }
        else {
            logger_1.Logger.trace(`Ending TCP stream`);
            stream.end();
        }
    }
};
TcpSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'tcp' }),
    __metadata("design:paramtypes", [Object])
], TcpSubscription);
exports.TcpSubscription = TcpSubscription;

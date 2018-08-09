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
const fs = __importStar(require("fs"));
const logger_1 = require("../loggers/logger");
let UdsSubscription = class UdsSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.path = subscriptionAttributes.path;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.server.on('connection', (stream) => {
                this.stream = stream;
                this.stream.once('end', () => {
                    logger_1.Logger.debug(`Uds server detected stream's end`);
                    reject();
                });
                this.stream.on('data', (msg) => {
                    if (!this.response) {
                        this.stream.end();
                    }
                    resolve(msg);
                });
            });
        });
    }
    sendResponse() {
        if (this.stream) {
            logger_1.Logger.debug(`Uds server sending response`);
            this.stream.write(this.response);
            this.stream.end();
            this.stream = null;
        }
        else {
            logger_1.Logger.warning(`No uds response was sent because uds stream is null`);
        }
    }
    connect() {
        return new Promise((resolve) => {
            fs.unlink(this.path, () => {
                this.server = net.createServer()
                    .listen(this.path, () => {
                    resolve();
                });
            });
        });
    }
    unsubscribe() {
        if (this.stream) {
            this.stream.end();
            this.stream = null;
        }
        this.server.close();
    }
};
UdsSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'uds' }),
    __metadata("design:paramtypes", [Object])
], UdsSubscription);
exports.UdsSubscription = UdsSubscription;

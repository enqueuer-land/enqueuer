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
const subscription_1 = require("./subscription");
const conditional_injector_1 = require("conditional-injector");
const dgram = __importStar(require("dgram"));
const logger_1 = require("../loggers/logger");
let UdpSubscription = class UdpSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.port = subscriptionAttributes.port;
        if (typeof subscriptionAttributes.response != 'string') {
            this.response = JSON.stringify(subscriptionAttributes.response);
        }
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.server.on('error', (err) => {
                reject(err);
            });
            this.server.on('message', (msg, remoteInfo) => {
                resolve({ payload: msg, remoteInfo: remoteInfo });
            });
        });
    }
    subscribe() {
        return new Promise((resolve, reject) => {
            this.server = dgram.createSocket('udp4');
            try {
                this.server.bind(this.port);
                resolve();
            }
            catch (err) {
                const message = `Udp server could not listen to ${this.port}`;
                logger_1.Logger.error(message);
                reject(message);
            }
        });
    }
    unsubscribe() {
        if (this.server) {
            this.server.close();
        }
    }
};
UdpSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'udp' }),
    __metadata("design:paramtypes", [Object])
], UdpSubscription);
exports.UdpSubscription = UdpSubscription;

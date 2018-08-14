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
const logger_1 = require("../loggers/logger");
const zmq = __importStar(require("zeromq"));
let ZeroMqSubSubscription = class ZeroMqSubSubscription extends subscription_1.Subscription {
    constructor(subscriptionModel) {
        super(subscriptionModel);
        this.address = subscriptionModel.address;
        this.topic = subscriptionModel.topic;
        this.socket = zmq.socket('sub');
    }
    receiveMessage() {
        return new Promise((resolve) => {
            logger_1.Logger.trace(`ZeroMqSub waiting for a message related to topic ${this.topic}`);
            this.socket.on('message', (topic, message) => {
                logger_1.Logger.debug(`ZeroMqSub received a message related to topic ${topic.toString()}`);
                resolve({ topic: topic, payload: message });
            });
        });
    }
    subscribe() {
        logger_1.Logger.trace(`ZeroMqSub trying to connect to zeroMq ${this.address}`);
        this.socket = this.socket.connect(this.address);
        this.socket = this.socket.subscribe(this.topic);
        logger_1.Logger.debug(`ZeroMqSub connected to zeroMq ${this.address}`);
        return Promise.resolve();
    }
    unsubscribe() {
        this.socket.close();
    }
};
ZeroMqSubSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'zero-mq-sub' }),
    __metadata("design:paramtypes", [Object])
], ZeroMqSubSubscription);
exports.ZeroMqSubSubscription = ZeroMqSubSubscription;
